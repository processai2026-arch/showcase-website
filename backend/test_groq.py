import asyncio
import os
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv("/home/karthikeyan/vscode/showcase-website/backend/.env", override=True)

async def test():
    client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
    try:
        chat_completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": "hello"}],
            model="llama3-8b-8192", 
            max_tokens=250,
        )
        print("Success:", chat_completion.choices[0].message.content)
    except Exception as e:
        print("Groq Error:", e)

asyncio.run(test())
