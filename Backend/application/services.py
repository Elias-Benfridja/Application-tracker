import os 
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key = os.environ.get("GEMINI_API_KEY"))

def build_prompt(country: str, purpose: str) -> str:
    return f"""
You are a visa and application tacker.
Return a JSON array of the documents need to apply for {purpose} in {country}
each item must have these fields:
- name: string
- description: one short sentence explaining what is this document
- details: tips on how and where to get the document
Return ONLY the JSON array. No markdown, no explanation, no code fences.
Example format:
[
  {{
    "name": "...",
    "description": "...",
    "details": "..."
  }}
]
"""


def generate_document_checklist(country: str, purpose: str) -> list:
    prompt = build_prompt(country,purpose)
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")
    # Clean and parse response
    raw = response.text.strip()

    start = raw.index('[')
    end = raw.rindex(']') + 1
    raw = raw[start:end]

    documents = json.loads(raw)
    return documents