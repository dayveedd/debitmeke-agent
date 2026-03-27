import { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Terminal, X, Zap } from 'lucide-react';

export const AdminSimulator = ({ ngrokUrl }: { ngrokUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { cards } = useStore();
    const [selectedCardId, setSelectedCardId] = useState('');
    const [merchant, setMerchant] = useState('Netflix');
    const [amount, setAmount] = useState('4900');
    // Default to the provided ngrok URL if available, else localhost
    const defaultUrl = ngrokUrl.endsWith('/') ? `${ngrokUrl}api/webhook/merchant-charge` : `${ngrokUrl}/api/webhook/merchant-charge`;
    const [webhookUrl, setWebhookUrl] = useState(ngrokUrl ? defaultUrl : 'http://localhost:8000/api/webhook/merchant-charge');
    const [status, setStatus] = useState('');

    const handleSimulate = async () => {
        const cardIdToUse = selectedCardId || (cards.length > 0 ? cards[0].id : '');
        if (!cardIdToUse) {
            setStatus("Error: No cards available");
            return;
        }

        try {
            setStatus('Sending...');
            const res = await axios.post(webhookUrl, {
                card_id: cardIdToUse,
                merchant,
                requested_amount: parseInt(amount)
            });
            setStatus(`Response: ${res.data.status || 'Sent'}`);
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    }

    if (!isOpen) {
        return (
             <button 
               onClick={() => setIsOpen(true)}
               className="absolute bottom-28 left-6 z-50 bg-gray-900 border border-gray-700 hover:border-accent-gold text-gray-400 hover:text-accent-gold p-4 rounded-full transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center group"
             >
                <Terminal className="w-6 h-6" />
                <span className="w-0 overflow-hidden group-hover:w-auto group-hover:ml-3 whitespace-nowrap transition-all text-xs font-black tracking-widest uppercase">Admin Tester</span>
             </button>
        );
    }

    return (
        <div className="absolute bottom-28 left-6 z-50 bg-charcoal-light border border-gray-700 rounded-2xl w-80 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center text-accent-gold font-bold text-sm tracking-wide uppercase">
                    <Terminal className="w-4 h-4 mr-2" />
                    Admin Webhook Simulator
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5 flex flex-col space-y-4">
                
                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Webhook URL</label>
                    <input 
                        type="text" 
                        value={webhookUrl} 
                        onChange={e => setWebhookUrl(e.target.value)}
                        className="w-full bg-charcoal border border-gray-700 rounded p-2 text-xs text-primary-orange focus:outline-none focus:border-primary-orange"
                    />
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Select Active Card</label>
                    <select 
                        value={selectedCardId}
                        onChange={e => setSelectedCardId(e.target.value)}
                        className="w-full bg-charcoal border border-gray-700 rounded p-2 text-xs text-white focus:outline-none focus:border-primary-orange"
                    >
                        {cards.length === 0 && <option value="">No cards available</option>}
                        {cards.map(c => (
                            <option key={c.id} value={c.id}>{c.merchant_name} - ₦{c.limit}</option>
                        ))}
                    </select>
                </div>

                <div className="flex space-x-2">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Merchant</label>
                        <input 
                            type="text" 
                            value={merchant} 
                            onChange={e => setMerchant(e.target.value)}
                            className="w-full bg-charcoal border border-gray-700 rounded p-2 text-xs text-white focus:outline-none focus:border-primary-orange"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Amount (₦)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-charcoal border border-gray-700 rounded p-2 text-xs text-white focus:outline-none focus:border-primary-orange"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSimulate}
                    className="w-full bg-accent-gold hover:bg-yellow-500 text-charcoal font-black uppercase tracking-wider text-xs py-3 rounded-lg flex justify-center items-center transition-all mt-2"
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Fire Webhook
                </button>

                {status && (
                    <div className="text-xs font-mono p-2 bg-charcoal border border-gray-700 rounded text-gray-300 break-words">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};
