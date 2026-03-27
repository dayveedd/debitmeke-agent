# DebitMeKe AI Agent

DebitMeKe is an autonomous, AI-powered virtual card management system designed to protect users from unwanted subscription charges. By leveraging an interactive AI chat, users can instantly provision securely bounded, frozen virtual cards exactly when they need them.

## Key Features
- **AI-Powered Card Generation**: Chat with the "DebitMeKe Agent" powered by Google's Gemini 2.5 Flash Lite to instantly provision virtual cards merely by typing (e.g., "Create a Netflix card for 5000").
- **Secure Step-Up Authorization**: By default, all newly issued virtual cards are frozen. Any merchant charge attempts are intercepted via Webhooks and routed back to the user to require explicit cryptographic authorization via Auth0 JWTs.
- **Supabase Persistence**: Real-time logging of user wallets, virtual card limits, and exact transaction histories to a live Supabase PostgreSQL database.
- **Modern React Dashboard**: A stunning, ultra-responsive dark-themed dashboard utilizing Vite and Tailwind CSS v4 for immediate feedback and seamless card management.
- **Admin Transaction Simulator**: A built-in webhook simulator widget enables developers and hackathon judges to instantly test the end-to-end charge interception workflow directly from the browser browser without needing Postman.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Auth0, Zustand, Lucide Icons, Axios
- **Backend**: FastAPI, Python, PyJWT (for cryptographic token verification)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash-lite` for ultra-low latency intent parsing)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ngrok (for local Webhook tunneling)

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
```

### 2. Run the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Ngrok (For Webhooks)
```bash
ngrok http 8000
```
*(Copy the Ngrok URL and paste it into the Admin Tester widget on the dashboard to simulate live charges!)*
