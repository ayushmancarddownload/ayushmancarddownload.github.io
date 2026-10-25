import os
import sys
import time
from datetime import datetime
from google import genai
from google.genai import types

# 1. API Key aur URL get karein
api_key = os.getenv("GEMINI_API_KEY")
youtube_url = sys.argv[1] if len(sys.argv) > 1 else ""

if not youtube_url:
    print("Error: No YouTube URL provided.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

# 2. Astro JS prompt
prompt = f"""
Please watch and understand this video thoroughly.
Write a comprehensive, engaging, and SEO-friendly blog article in Markdown for an Astro JS site based on the video's content.

STRICT REQUIREMENT: You MUST start the file with this EXACT frontmatter:

---
title: "Catchy Blog Title Here"
description: "A short 2-line summary of what this article is about"
pubDate: "{datetime.now().strftime('%Y-%m-%d')}"
tags: ["Tech", "Guide", "Update"]
---

(Write the complete article in Markdown with headings H2, H3, bullet points, and key takeaways)
"""

# 3. Available Models list
models_to_try = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash"
]

response = None

# 4. Smart Retry Loop (503 aane par ruk kar dobara try karega)
for model_name in models_to_try:
    if response:
        break
        
    for attempt in range(1, 4):  # Har model ko 3 baar try karega
        try:
            print(f"Trying model: {model_name} (Attempt {attempt}/3)...")
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_uri(file_uri=youtube_url, mime_type="video/mp4"),
                    prompt
                ]
            )
            print(f"Successfully generated article using {model_name}!")
            break
        except Exception as e:
            err_msg = str(e)
            if "503" in err_msg:
                wait_time = attempt * 12
                print(f"Google server busy (503). Waiting {wait_time}s before retrying...")
                time.sleep(wait_time)
            else:
                print(f"Failed with {model_name}: {err_msg}")
                break

if not response:
    print("Error: Could not generate content after all retries.")
    sys.exit(1)

# 5. Save to Astro Content folder
folder_path = "src/content/blog"
os.makedirs(folder_path, exist_ok=True)

file_name = f"youtube-post-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
full_path = os.path.join(folder_path, file_name)

with open(full_path, "w", encoding="utf-8") as f:
    f.write(response.text)

print(f"Post successfully created at: {full_path}")
