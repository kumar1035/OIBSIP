import anthropic
from app.config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are Aria, an AI-powered voice assistant. You are helpful, friendly, and concise.

Guidelines:
- Give clear, conversational responses optimized for voice output
- Keep answers brief (1-3 sentences) unless the user asks for detail
- Be warm and professional in tone
- If you don't know something, say so honestly
- You can help with: questions, explanations, writing, math, coding, and general conversation"""


async def get_ai_response(messages: list[dict]) -> str:
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=messages,
    )
    return response.content[0].text
