import { useEffect, useState } from 'react';
import axios from 'axios';
import { History, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const TransactionHistory = () => {
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchTxs = async () => {
            try {
                const res = await axios.get(`${API_URL}/transactions`);
                setTransactions(res.data.transactions);
            } catch (e) {
                console.error("Failed to fetch transactions", e);
            }
        };
        fetchTxs();
        const interval = setInterval(fetchTxs, 3000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        if (status.includes('Success')) return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (status.includes('Failed')) return <XCircle className="w-5 h-5 text-red-500" />;
        return <Clock className="w-5 h-5 text-accent-gold" />;
    };

    return (
        <div className="mt-12 bg-charcoal-light border border-gray-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-gray-400 mb-6 uppercase tracking-widest text-sm flex items-center">
                <History className="w-5 h-5 mr-2 text-gray-500" />
                Transaction History
            </h2>

            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-700 rounded-2xl">
                    <Activity className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No transactions recorded yet.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
                                <th className="p-4 font-bold border-b border-gray-800">Status</th>
                                <th className="p-4 font-bold border-b border-gray-800">Merchant</th>
                                <th className="p-4 font-bold border-b border-gray-800">Amount</th>
                                <th className="p-4 font-bold border-b border-gray-800">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4 flex items-center">
                                        {getStatusIcon(tx.status)}
                                        <span className={`ml-3 text-xs font-bold uppercase tracking-wider ${
                                            tx.status.includes('Success') ? 'text-green-500' :
                                            tx.status.includes('Failed') ? 'text-red-500' : 'text-accent-gold'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-off-white">{tx.merchant}</td>
                                    <td className="p-4 font-mono text-primary-orange font-bold">₦{(Number(tx.amount) || 0).toLocaleString()}</td>
                                    <td className="p-4 text-xs text-gray-500 font-mono">
                                        {new Date(tx.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
