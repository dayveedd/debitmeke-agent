import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { VirtualCard } from './VirtualCard';
import { TransactionHistory } from './TransactionHistory';
import { Plus, Wallet, ShieldAlert, Lock } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export const Vault = () => {
  const { balance, cards, setBalance, setCards } = useStore();
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('10000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const balRes = await axios.get(`${API_URL}/wallet`);
        setBalance(balRes.data.balance);
        const cardsRes = await axios.get(`${API_URL}/cards`);
        setCards(cardsRes.data.cards);
      } catch (e) { console.error("Initial load failed", e); }
    };
    fetchVault();
  }, [setBalance, setCards]);

  const handleFund = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/fund-wallet`, { amount: parseInt(fundAmount), user_id: 'user_1' });
      setBalance(res.data.balance);
      setShowFundModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateMerchantCharge = async (cardItem: any) => {
    try {
        // We mock a webhook hit triggered by user button for demo purposes
        await axios.post(`${API_URL}/webhook/merchant-charge`, {
           card_id: cardItem.id,
           merchant: cardItem.merchant_name,
           requested_amount: cardItem.limit - 100 // Simulate amount near limit
        });
        // Frontend will pick up the alert on the next 3-second poll in Chat.tsx!
    } catch (e) {
        console.error("Simulation failed", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-charcoal overflow-y-auto w-full relative">
      <div className="p-8 border-b border-gray-800 flex justify-between items-center relative overflow-hidden bg-charcoal-light">
        {/* Decorative background glow */}
        <div className="absolute top-[-80px] right-[-20%] w-[500px] h-[300px] bg-primary-orange/5 rounded-[100%] blur-3xl pointer-events-none"></div>

        <div className="z-10 relative">
          <h1 className="text-3xl font-extrabold text-off-white mb-2 flex items-center">
            <Wallet className="w-8 h-8 mr-3 text-primary-orange" />
            Main Wallet
          </h1>
          <div className="text-6xl font-mono text-primary-orange font-bold tracking-tight drop-shadow-lg">
            ₦{balance.toLocaleString()}
          </div>
        </div>
        
        <button 
          onClick={() => setShowFundModal(true)}
          className="z-10 relative flex items-center space-x-2 bg-charcoal border border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-charcoal font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(255,107,0,0.15)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)] transform hover:-translate-y-1"
        >
          <Plus className="w-6 h-6 mr-1" />
          <span className="text-lg uppercase tracking-wider">Fund Wallet</span>
        </button>
      </div>

      {/* Cards Area */}
      <div className="p-10 flex-auto bg-charcoal overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest text-sm flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-gray-500" />
          Protected Virtual Cards ({cards.length})
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
          {cards.map(card => (
             <div key={card.id} className="flex flex-col">
               <VirtualCard card={card} />
               <button 
                  // Quick tester button for the mock
                  onClick={() => simulateMerchantCharge(card)}
                  className="mt-4 text-xs tracking-widest uppercase font-bold text-gray-500 hover:text-accent-gold transition-colors text-center w-full"
               >
                 [⚡ DEMO: Simulate ₦{(card.limit - 100).toLocaleString()} Charge]
               </button>
             </div>
          ))}
          {cards.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-12 py-32 border-2 border-dashed border-gray-800 rounded-3xl bg-charcoal-light/50">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 mb-6 shadow-inner">
                   <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-300 text-xl font-medium tracking-wide">No cards provisioned yet.</p>
                 <p className="text-md text-gray-500 mt-2 text-center max-w-sm">Use the Rebel AI Agent on the left to instantly issue heavily guarded frozen virtual cards.</p>
             </div>
          )}
        </div>

        <TransactionHistory />

      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 transition-opacity">
          <div className="bg-charcoal border border-gray-700 rounded-3xl p-8 w-[450px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-3xl font-black mb-6 text-off-white tracking-wide">Add Funds</h3>
            <div className="mb-8">
              <label className="block text-gray-400 text-sm font-bold uppercase tracking-widest mb-3">Amount (₦)</label>
              <input 
                type="number" 
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full bg-charcoal-light border border-gray-700 rounded-xl py-4 px-5 text-xl font-mono text-primary-orange focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all shadow-inner"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowFundModal(false)}
                className="px-6 py-3 text-gray-400 hover:text-white font-bold tracking-wide uppercase text-sm transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleFund}
                disabled={loading}
                className="px-8 py-3 bg-primary-orange text-charcoal font-black rounded-xl uppercase tracking-wider text-sm hover:bg-orange-600 transition-all shadow-[0_4px_15px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center min-w-[140px]"
              >
                {loading ? 'Adding...' : 'Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
