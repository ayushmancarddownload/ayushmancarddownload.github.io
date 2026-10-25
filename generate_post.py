import os
import sys
import re
import urllib.request
from datetime import datetime
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai

# 1. YouTube Video ID nikalna
def get_video_id(url):
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    if len(url.strip()) == 11:
        return url.strip()
    return None

# 2. Transcript extract karna (New v1.2+ & v0.6+ Compatible)
def extract_transcript(video_id):
    print(f"Fetching transcript for Video ID: {video_id}...")
    
    # Naye YouTubeTranscriptApi v1.x ke liye
    try:
        api = YouTubeTranscriptApi()
        try:
            fetched = api.fetch(video_id, languages=['hi', 'en', 'en-IN'])
        except Exception:
            fetched = api.fetch(video_id)
            
        text_parts = []
        for item in fetched:
            if hasattr(item, 'text'):
                text_parts.append(item.text)
            elif isinstance(item, dict) and 'text' in item:
                text_parts.append(item['text'])
            else:
                text_parts.append(str(item))
        if text_parts:
            return " ".join(text_parts)
    except Exception as e:
        print(f"New API method notice: {e}")

    # Fallback to older static get_transcript
    try:
        if hasattr(YouTubeTranscriptApi, 'get_transcript'):
            try:
                data = YouTubeTranscriptApi.get_transcript(video_id, languages=['hi', 'en', 'en-IN'])
            except Exception:
                data = YouTubeTranscriptApi.get_transcript(video_id)
            return " ".join([item['text'] for item in data])
    except Exception as e:
        print(f"Legacy method notice: {e}")

    return None

# 3. Clean Markdown Output
def clean_markdown_output(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return text.strip()

# Main Execution
api_key = os.getenv("GEMINI_API_KEY")
youtube_url = sys.argv[1] if len(sys.argv) > 1 else ""

if not youtube_url:
    print("Error: No YouTube URL provided.")
    sys.exit(1)

video_id = get_video_id(youtube_url)
if not video_id:
    print("Error: Invalid YouTube URL.")
    sys.exit(1)

transcript_text = extract_transcript(video_id)
if not transcript_text:
    print("Error: Could not extract transcript.")
    sys.exit(1)

print(f"Transcript fetched successfully ({len(transcript_text)} characters)!")

# 4. Thumbnail Download for Astro Image Optimizer
img_folder = "public/images/posts"
os.makedirs(img_folder, exist_ok=True)
img_filename = f"yt-{video_id}.jpg"
img_path = os.path.join(img_folder, img_filename)

try:
    thumb_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    urllib.request.urlretrieve(thumb_url, img_path)
    print(f"Thumbnail saved to {img_path}")
except Exception:
    thumb_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
    urllib.request.urlretrieve(thumb_url, img_path)

cover_image_path = f"/images/posts/{img_filename}"

# 5. Strict Schema Prompt
client = genai.Client(api_key=api_key)
today_date = datetime.now().strftime('%Y-%m-%d')

prompt = f"""
You are an expert editorial blog writer.
Analyze this YouTube video transcript thoroughly and generate a comprehensive, highly engaging, long-form Markdown article.

Transcript:
---
{transcript_text}
---

CRITICAL ASTRO SCHEMA REQUIREMENTS:
1. title: MAXIMUM 60 CHARACTERS (Strictly less than 70 chars).
2. description: MAXIMUM 140 CHARACTERS (Strictly less than 160 chars).
3. Do NOT wrap output in triple backticks (```markdown).

Start directly with this EXACT Frontmatter:

---
title: "Punchy Title Under 60 Chars"
description: "Short engaging summary under 140 characters."
pubDate: {today_date}
author: "priya-shah"
coverImage: "{cover_image_path}"
coverAlt: "Insightful illustration representing the video core topic"
category: "Life Strategy"
isFeatured: false
draft: false
faq:
  - q: "What is the key takeaway from this discussion?"
    a: "Clear, direct, and actionable explanation in one sentence."
  - q: "Why is this advice important for modern relationships?"
    a: "Contextual explanation based on the speaker's core points."
  - q: "What should one avoid doing in this situation?"
    a: "Specific mistake to avoid as emphasized in the video."
---

(Write the complete, well-structured long-form article below the frontmatter with H2, H3 headings, key takeaways, and conclusions)
"""

print("Generating article with Gemini...")
response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt
)

final_content = clean_markdown_output(response.text)

# 6. Save Markdown Post
blog_folder = "src/content/blog"
os.makedirs(blog_folder, exist_ok=True)

file_name = f"post-{today_date}-{video_id}.md"
full_path = os.path.join(blog_folder, file_name)

with open(full_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print(f"Post successfully created at: {full_path}")
