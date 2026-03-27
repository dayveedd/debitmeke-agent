import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")

MOCK_WALLET = {"user_1": 100000}
MOCK_CARDS = []
MOCK_TRANSACTIONS = []

def get_balance(user_id="user_1"):
    if supabase:
        res = supabase.table("Users").select("main_balance").eq("id", user_id).execute()
        if res.data: return res.data[0]["main_balance"]
    return MOCK_WALLET.get(user_id, 0)

def update_balance(amount: int, user_id="user_1"):
    if supabase:
        current = get_balance(user_id)
        supabase.table("Users").update({"main_balance": current + amount}).eq("id", user_id).execute()
    else:
        MOCK_WALLET[user_id] = MOCK_WALLET.get(user_id, 0) + amount
    return get_balance(user_id)

def create_virtual_card(merchant_name: str, limit: int, user_id="user_1"):
    card = {"user_id": user_id, "merchant_name": merchant_name, "limit_amount": limit, "status": "frozen"}
    if supabase:
        res = supabase.table("Virtual_Cards").insert(card).execute()
        parsed = dict(res.data[0])
        parsed["limit"] = parsed.pop("limit_amount")
        return parsed
    
    import uuid
    card["id"] = str(uuid.uuid4())
    MOCK_CARDS.append(card)
    parsed = dict(card)
    parsed["limit"] = parsed.pop("limit_amount")
    return parsed

def get_cards(user_id="user_1"):
    if supabase:
        res = supabase.table("Virtual_Cards").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        cards = []
        for c in res.data:
            c["limit"] = c.pop("limit_amount")
            cards.append(c)
        return cards
    
    cards = []
    for c in reversed(MOCK_CARDS):
        if c["user_id"] == user_id:
            cp = dict(c)
            cp["limit"] = cp.pop("limit_amount")
            cards.append(cp)
    return cards

def get_card_by_id(card_id: str):
    if supabase:
        res = supabase.table("Virtual_Cards").select("*").eq("id", card_id).execute()
        if res.data: 
            c = res.data[0]
            c["limit"] = c.pop("limit_amount")
            return c
    for c in MOCK_CARDS:
        if c["id"] == card_id: 
            cp = dict(c)
            cp["limit"] = cp.pop("limit_amount")
            return cp
    return None

def update_card_status(card_id: str, status: str):
    if supabase:
        supabase.table("Virtual_Cards").update({"status": status}).eq("id", card_id).execute()
    else:
        for c in MOCK_CARDS:
            if c["id"] == card_id:
                c["status"] = status

def update_card_limit(card_id: str, new_limit: int):
    if supabase:
        supabase.table("Virtual_Cards").update({"limit_amount": new_limit}).eq("id", card_id).execute()
    else:
        for c in MOCK_CARDS:
            if c["id"] == card_id:
                c["limit_amount"] = new_limit

def record_transaction(user_id: str, card_id: str, amount: int, merchant: str, status: str):
    tx = {
        "user_id": user_id,
        "card_id": card_id,
        "amount": amount,
        "merchant": merchant,
        "status": status
    }
    if supabase:
        res = supabase.table("Transactions").insert(tx).execute()
        return res.data[0]
    
    import uuid
    import datetime
    tx["id"] = str(uuid.uuid4())
    tx["created_at"] = str(datetime.datetime.now())
    MOCK_TRANSACTIONS.append(tx)
    return tx

def get_transactions(user_id="user_1"):
    if supabase:
        res = supabase.table("Transactions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    
    return sorted(
        [t for t in MOCK_TRANSACTIONS if t["user_id"] == user_id],
        key=lambda x: x["created_at"],
        reverse=True
    )
