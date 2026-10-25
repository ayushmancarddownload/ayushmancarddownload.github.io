import os
import sys
import re
from datetime import datetime
from google import genai

# 1. Clean Markdown Wrapper
def clean_markdown_output(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return text.strip()

# 2. transcript.txt read karna
transcript_file = "transcript.txt"
if not os.path.exists(transcript_file):
    print("Error: transcript.txt file not found!")
    sys.exit(1)

with open(transcript_file, "r", encoding="utf-8") as f:
    transcript_text = f.read().strip()

if not transcript_text:
    print("Error: transcript.txt is empty!")
    sys.exit(1)

print(f"Transcript loaded successfully ({len(transcript_text)} characters)!")

# 3. Astro Cover Image Handle karna (Bina Download kiye schema satisfy karna)
img_folder = "public/images/posts"
os.makedirs(img_folder, exist_ok=True)

# Pehle se mojood koi bhi image dhoondo
existing_images = [f for f in os.listdir(img_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]

if existing_images:
    cover_image_path = f"/images/posts/{existing_images[0]}"
else:
    # Agar folder khali ho to 1 safe default image bana do taaki optimize-images na toote
    default_img_name = "default-cover.jpg"
    default_img_path = os.path.join(img_folder, default_img_name)
    tiny_jpeg = (
        b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
        b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
        b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
        b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342'
        b'\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4'
        b'\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00'
        b'\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b'
        b'\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'
    )
    with open(default_img_path, "wb") as f:
        f.write(tiny_jpeg)
    cover_image_path = f"/images/posts/{default_img_name}"

print(f"Cover image reference set to: {cover_image_path}")

# 4. Strict Astro Prompt
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
today_date = datetime.now().strftime('%Y-%m-%d')
post_id = datetime.now().strftime('%Y%m%d-%H%M%S')

prompt = f"""
You are an expert editorial writer.
Read the following transcript carefully and write a deep, comprehensive, engaging blog article in Markdown for an Astro JS site.

Transcript:
---
{transcript_text}
---

CRITICAL ASTRO SCHEMA RULES (Strict):
1. title: MAXIMUM 60 CHARACTERS (Strictly under 70 characters).
2. description: MAXIMUM 140 CHARACTERS (Strictly under 160 characters).
3. Do NOT include ```markdown wrapper. Start directly with ---.

Strict Frontmatter format:

---
title: "Punchy Title Under 60 Chars"
description: "Short engaging summary under 140 characters."
pubDate: {today_date}
author: "priya-shah"
coverImage: "{cover_image_path}"
coverAlt: "Insightful illustration representing the core topic"
category: "Life Strategy"
isFeatured: false
draft: false
faq:
  - q: "What is the core takeaway from this discussion?"
    a: "Clear, direct, and actionable explanation in one sentence."
  - q: "Why is this insight important?"
    a: "Contextual explanation based on the core points."
  - q: "What is the common mistake to avoid?"
    a: "Specific mistake to avoid as emphasized in the transcript."
---

(Write the complete, well-structured long-form article below the frontmatter with H2, H3 headings, key takeaways, and conclusions)
"""

print("Sending transcript to Gemini 3.8 Flash...")
response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt
)

final_content = clean_markdown_output(response.text)

# 5. Save Markdown Post
blog_folder = "src/content/blog"
os.makedirs(blog_folder, exist_ok=True)

file_name = f"post-{post_id}.md"
full_path = os.path.join(blog_folder, file_name)

with open(full_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print(f"Article successfully created at: {full_path}")
