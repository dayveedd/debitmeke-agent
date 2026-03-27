import os
import jwt
from jwt import PyJWKClient
from fastapi import FastAPI, Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from db import get_balance, update_balance, create_virtual_card, get_cards, get_card_by_id, update_card_status, update_card_limit, record_transaction, get_transactions
from agent import parse_intent

app = FastAPI(title="DebitMeKe? API")

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "dev-vjpn1o7kslp2ukcn.us.auth0.com")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "BOip57radbWRC1Xo7VczppNZIGnOSqGb")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if token == "mocked-token":
        return {"sub": "mock_user"}
        
    try:
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=AUTH0_CLIENT_ID,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Authentication Token: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global alerts queue for simplicity without websockets
PENDING_ALERTS = []

@app.get("/api/wallet")
def get_user_wallet(user_id: str = "user_1"):
    return {"balance": get_balance(user_id)}

@app.post("/api/fund-wallet")
async def fund_wallet(req: Request):
    data = await req.json()
    amount = data.get("amount", 0)
    user_id = data.get("user_id", "user_1")
    new_balance = update_balance(amount, user_id)
    return {"balance": new_balance}

@app.get("/api/cards")
def list_cards(user_id: str = "user_1"):
    return {"cards": get_cards(user_id)}

@app.post("/api/chat")
async def chat(req: Request):
    data = await req.json()
    message = data.get("message", "")
    user_id = data.get("user_id", "user_1")
    
    intent = parse_intent(message)
    action = intent.get("action")
    
    if action == "create_card":
        merchant = intent.get("merchant") or "Unknown Merchant"
        limit = intent.get("limit")
        limit = limit if isinstance(limit, (int, float)) else 5000
        card = create_virtual_card(merchant, limit, user_id)
        return {"reply": f"✅ {card['merchant_name']} card created with limit ₦{limit} and frozen.", "action": action, "data": card}
    
    elif action == "check_balance":
        balance = get_balance(user_id)
        return {"reply": f"Your current Main Wallet balance is ₦{balance}.", "action": action}
        
    elif action == "fund_wallet":
        return {"reply": "Please use the 'Fund Wallet' button in the dashboard Vault.", "action": action}
        
    else:
        return {"reply": intent.get("message", "I didn't quite catch that."), "action": "reply"}

@app.post("/api/webhook/merchant-charge")
async def merchant_charge(req: Request):
    data = await req.json()
    card_id = data.get("card_id")
    merchant = data.get("merchant")
    amount = data.get("requested_amount")
    
    card = get_card_by_id(card_id)
    if not card:
         return {"status": "rejected", "reason": "Card not found"}
         
    if card.get("status") == "frozen":
         alert = {
             "id": f"alert_{card_id}_{amount}",
             "message": f"⚠️ {merchant} is trying to debit ₦{amount}. Do you authorize this?",
             "card_id": card_id,
             "amount": amount,
             "merchant": merchant
         }
         PENDING_ALERTS.append(alert)
         record_transaction(card.get("user_id"), card_id, amount, merchant, "Hold (Requires Authorization)")
         return {"status": "hold", "reason": "Card is frozen. Step-up authorization required.", "alert_queued": True}
         
    balance = get_balance(card.get("user_id"))
    limit = card.get("limit")
    if balance >= amount and limit >= amount:
        update_balance(-amount, card.get("user_id"))
        update_card_limit(card_id, limit - amount)
        record_transaction(card.get("user_id"), card_id, amount, merchant, "Success")
        return {"status": "approved", "processed_amount": amount}
        
    record_transaction(card.get("user_id"), card_id, amount, merchant, "Failed (Insufficient Limit/Balance)")
    return {"status": "rejected", "reason": "Insufficient funds or limit exceeded"}

@app.get("/api/alerts")
def get_alerts():
    # Simple long-polling or just fetch endpoint
    alerts = list(PENDING_ALERTS)
    PENDING_ALERTS.clear()
    return {"alerts": alerts}

@app.post("/api/authorize-charge")
async def authorize_charge(req: Request, token_data: dict = Depends(verify_token)):
    data = await req.json()
    card_id = data.get("card_id")
    amount = data.get("amount")
    
    card = get_card_by_id(card_id)
    if not card:
        return {"status": "error", "message": "Card not found"}
        
    user_id = card.get("user_id")
    balance = get_balance(user_id)
    limit = card.get("limit")
    
    if balance >= amount and limit >= amount:
        update_balance(-amount, user_id)
        update_card_limit(card_id, limit - amount)
        update_card_status(card_id, "frozen") # immediately reset to frozen
        record_transaction(user_id, card_id, amount, card.get("merchant_name"), "Success (Authorized)")
        return {"status": "success", "message": f"Successfully authorized ₦{amount} for {card.get('merchant_name')}"}
    
    record_transaction(user_id, card_id, amount, card.get("merchant_name"), "Failed (Insufficient Limit/Balance)")
    return {"status": "error", "message": "Insufficient Main Wallet balance or Card Limit"}

@app.get("/api/transactions")
def list_transactions(user_id: str = "user_1"):
    return {"transactions": get_transactions(user_id)}
