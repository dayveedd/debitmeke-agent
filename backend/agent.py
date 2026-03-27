import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Using ultra-fast lite model for near-instant latency and 0 temperature for deterministic JSON structure
    model = genai.GenerativeModel("gemini-2.5-flash-lite", generation_config={"temperature": 0.0})

def parse_intent(user_message: str):
    if not GEMINI_API_KEY:
        # Mock behavior for immediate hackathon demo if key is not injected
        lower_msg = user_message.lower()
        if "netflix" in lower_msg:
            return {"action": "create_card", "merchant": "Netflix", "limit": 5000}
        elif "balance" in lower_msg:
            return {"action": "check_balance"}
        elif "fund" in lower_msg or "add money" in lower_msg:
            return {"action": "fund_wallet"}
        else:
            return {"action": "reply", "message": "API Key is missing."}

    prompt = f"""Extract user intent into pure JSON. 
Options for 'action': 'create_card', 'check_balance', 'fund_wallet', 'reply'.
If 'create_card', also extract 'merchant' (string) and 'limit' (number).

CRITICAL GUARDRAIL: You are the DebitMeKe Agent. If the user asks a general question completely unrelated to banking, virtual cards, or funding wallets (like "what is a software", coding, math, general chitchat), DO NOT ANSWER IT. Instead, set 'action' to 'reply' and exactly set 'message' to: "I am the DebitMeKe Agent. I can only assist you with creating virtual cards, checking your balance, and funding your wallet."

If the question is related to banking, set 'action' to 'reply' and provide a polite 'message'.
Output MUST be strictly raw JSON, no markdown blocks or surrounding text.

Message: {user_message}"""
    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        return {"action": "reply", "message": f"AI Parsing Hiccup: {e}"}
