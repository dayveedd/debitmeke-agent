import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Send, Loader2, AlertCircle, Cpu } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  isAlert?: boolean;
  alertData?: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: 'Sup! I am your DebitMeKe Agent. Need a frozen card? Just ask.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setBalance, setCards } = useStore();
  const { loginWithPopup, getAccessTokenSilently, getIdTokenClaims, isAuthenticated } = useAuth0();

  // Polling for alerts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
         const res = await axios.get(`${API_URL}/alerts`);
         if (res.data.alerts && res.data.alerts.length > 0) {
            res.data.alerts.forEach((alert: any) => {
               setMessages(prev => [...prev, {
                 id: alert.id,
                 sender: 'agent',
                 text: alert.message,
                 isAlert: true,
                 alertData: alert
               }]);
            });
         }
      } catch (e) { console.error("Polling error", e); }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const refreshVault = async () => {
     try {
       const balRes = await axios.get(`${API_URL}/wallet`);
       setBalance(balRes.data.balance);
       const cardsRes = await axios.get(`${API_URL}/cards`);
       setCards(cardsRes.data.cards);
     } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: userMsg, user_id: 'user_1' });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: res.data.reply
      }]);
      if (res.data.action === 'create_card' || res.data.action === 'fund_wallet') {
         await refreshVault();
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: 'Oops, backend is sleeping or unreachable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (alertData: any) => {
    setAuthorizingId(alertData.id);
    try {
      // Step-Up Auth via Auth0. If user didn't give auth0 keys, we just mock login
      let token = "mocked-token";
      try {
          if (!isAuthenticated) {
            await loginWithPopup();
          } else {
            await getAccessTokenSilently();
          }
          const claims = await getIdTokenClaims();
          if (claims) {
             token = claims.__raw;
          }
      } catch (authError) {
          console.warn("Auth0 not configured properly or cancelled. Mocking authorization for demo purposes.");
      }
      
      // Proceed with the charge via backend
      const res = await axios.post(`${API_URL}/authorize-charge`, {
         card_id: alertData.card_id,
         amount: alertData.amount,
         user_id: 'user_1'
      }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === 'success') {
         setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: `✅ Payment authorized. You show them who's boss.` }]);
         await refreshVault();
      } else {
         setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: `❌ Authorization failed: ${res.data.message}` }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: `❌ Step-Up Authentication failed.` }]);
    } finally {
      setAuthorizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-charcoal-light border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center text-off-white font-bold text-lg tracking-widest uppercase">
             <Cpu className="w-5 h-5 mr-3 text-accent-gold" />
             DebitMeKe Agent
          </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              msg.sender === 'user' 
                ? 'bg-charcoal text-off-white ml-12 rounded-tr-none border border-gray-800' 
                : 'bg-charcoal border-l-2 border-primary-orange text-gray-300 mr-12 rounded-tl-none border-y border-r border-gray-800'
            } ${msg.isAlert ? 'border border-accent-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : ''}`}>
              {msg.isAlert && <AlertCircle className="w-5 h-5 text-accent-gold mb-2 inline mr-2" />}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              
              {msg.isAlert && (
                <button 
                  onClick={() => handleAuthorize(msg.alertData)}
                  disabled={authorizingId === msg.alertData.id}
                  className="mt-3 w-full bg-primary-orange hover:bg-orange-600 text-charcoal font-bold py-2 px-4 rounded transition-colors text-sm flex justify-center items-center disabled:opacity-50"
                >
                  {authorizingId === msg.alertData.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> Authorizing...</>
                  ) : (
                      "Authorize via Auth0"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-charcoal border-l-2 border-primary-orange rounded-2xl rounded-tl-none p-3 mr-12 flex items-center space-x-2 border-y border-r border-gray-800">
               <Loader2 className="w-4 h-4 text-primary-orange animate-spin" />
               <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-charcoal-light border-t border-gray-800">
        <div className="flex relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type 'Create Netflix card...'"
            className="w-full bg-charcoal border border-gray-700 rounded-full py-3 pl-4 pr-12 text-off-white focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-primary-orange rounded-full text-charcoal hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
