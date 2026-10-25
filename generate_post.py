import os
import sys
import re
from datetime import datetime
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai

# 1. YouTube Video ID nikalne ka function
def get_video_id(url):
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    if len(url.strip()) == 11:
        return url.strip()
    return None

# 2. Transcript extract karne ka function
def extract_transcript(video_id):
    print(f"Fetching transcript for Video ID: {video_id}...")
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            transcript = transcript_list.find_transcript(['hi', 'en', 'en-IN'])
        except:
            transcript = next(iter(transcript_list))
        
        data = transcript.fetch()
        return " ".join([item['text'] for item in data])
    except Exception as e:
        print(f"Transcript Error: {e}")
        return None

# 3. Text cleaning function (Taaki Astro build na toote)
def clean_markdown_output(text):
    text = text.strip()
    # Agar Gemini ne ```markdown ya ``` se wrap kiya hai toh use hatayein
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

# 4. Strict Astro Schema Prompt
client = genai.Client(api_key=api_key)
today_date = datetime.now().strftime('%Y-%m-%d')

prompt = f"""
You are an expert technical and editorial blog writer.
Analyze this YouTube video transcript thoroughly and generate a comprehensive, highly engaging, long-form Markdown article.

Transcript:
---
{transcript_text}
---

CRITICAL REQUIREMENT:
The output MUST strictly begin with this EXACT YAML Frontmatter format (all fields are required for the Astro schema to build):

---
title: "A powerful, catchy headline directly derived from the core thesis"
description: "A compelling 2-sentence meta description summarizing the post."
pubDate: {today_date}
author: "admin"
coverImage: "https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
coverAlt: "Descriptive alt text for the cover image"
category: "Life Strategy"
isFeatured: false
draft: false
faq:
  - q: "Relevant Question 1 based on the video?"
    a: "Clear, insightful answer 1."
  - q: "Relevant Question 2 based on the video?"
    a: "Clear, insightful answer 2."
  - q: "Relevant Question 3 based on the video?"
    a: "Clear, insightful answer 3."
---

After the frontmatter, write the full, structured in-depth article in clean Markdown:
1. Use an engaging H1 title.
2. Introduction with the core hook.
3. Multiple structured H2 and H3 sections with detailed explanations, bullet points, and key takeaways.
4. Summary / Conclusion at the end.
Do NOT enclose the entire output in triple backtick code blocks (```markdown). Return raw markdown directly starting with ---.
"""

print("Sending transcript to Gemini...")
response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt
)

final_content = clean_markdown_output(response.text)

# 5. File name slug banana aur save karna
folder_path = "src/content/blog"
os.makedirs(folder_path, exist_ok=True)

# Clean file slug
file_name = f"post-{today_date}-{video_id}.md"
full_path = os.path.join(folder_path, file_name)

with open(full_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print(f"Post successfully created at: {full_path}")
