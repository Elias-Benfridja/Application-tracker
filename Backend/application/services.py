import os 
import json
from google import genai
from dotenv import load_dotenv
from .models import Application

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

def build_chat_prompt(question: str, country: str, purpose: str, documents: list) -> str:
    return f"""
You are a knowledgeable visa and immigration advisor helping someone with their application.

Application context:
- Destination country: {country}
- Purpose: {purpose}
- Required documents: {', '.join(documents)}

User's question: {question}

Instructions:
- Answer clearly and practically, using the context above when relevant.
- Keep your answer concise (2-4 sentences) unless the question genuinely requires more detail.
- If the question is unrelated to visas, immigration, or the documents listed, politely redirect the user back to visa-related topics.
- Avoid generic disclaimers like "consult an immigration lawyer" unless the question is genuinely legally complex — give a direct, useful answer first.
- Write in plain text, no markdown formatting.
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

def get_advisor_answer(application: Application, question: str) -> str:
    documents = []
    country = application.country
    purpose = application.purpose
    for item in application.applicationdocumentation_set.all():
        documents.append(item.document.name)
    prompt = build_chat_prompt(question, country, purpose, documents)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

    return response.text