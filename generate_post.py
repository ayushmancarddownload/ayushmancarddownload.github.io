import os
import sys
from datetime import datetime
from google import genai

# 1. API Key aur URL get karein
api_key = os.getenv("GEMINI_API_KEY")
youtube_url = sys.argv[1] if len(sys.argv) > 1 else ""

if not youtube_url:
    print("Error: No YouTube URL provided.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

# 2. Astro JS ke hisaab se Markdown generate karne ka prompt
prompt = f"""
Watch and analyze this YouTube video: {youtube_url}

Please write a high-quality, comprehensive, and engaging blog post for an Astro JS site based on the video.
STRICT REQUIREMENT: You MUST start the file with this EXACT frontmatter:

---
title: "Generate an interesting title from video"
description: "A short 2-line summary of what this article is about"
pubDate: "{datetime.now().strftime('%Y-%m-%d')}"
tags: ["YouTube", "AI"]
---

(After the frontmatter, write the full detailed article in Markdown with proper headings H2, H3, bullet points, and key takeaways)
"""

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[prompt]
)

# 3. Astro ke Blog folder ka path
# Agar aapka folder src/content/posts ya kuch aur hai, toh yaha badal lein:
folder_path = "src/content/blog"
os.makedirs(folder_path, exist_ok=True)

# File ka unique naam
file_name = f"youtube-post-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
full_path = os.path.join(folder_path, file_name)

with open(full_path, "w", encoding="utf-8") as f:
    f.write(response.text)

print(f"Post successfully created at: {full_path}")
