import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import type { Card } from '../store';

export const VirtualCard: React.FC<{ card: Card }> = ({ card }) => {
  const isFrozen = card.status === 'frozen';

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-full h-48 rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
        isFrozen 
          ? 'bg-gradient-to-br from-charcoal to-charcoal-light border border-accent-gold shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
          : 'bg-gradient-to-br from-charcoal-light to-gray-800 border border-primary-orange shadow-[0_0_15px_rgba(255,107,0,0.2)] hover:shadow-[0_0_25px_rgba(255,107,0,0.4)]'
      }`}
      style={{ perspective: 1000 }}
    >
      {/* Glossy overlay effect to look like a premium physical card */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-2xl mix-blend-overlay" />
      
      <div className="flex justify-between items-start z-10 w-full">
        <h3 className="text-2xl font-black tracking-wider text-off-white drop-shadow-md truncate max-w-[80%] pr-2">
          {card.merchant_name.toUpperCase()}
        </h3>
        {isFrozen ? (
          <div className="bg-charcoal p-2 rounded-full border border-accent-gold text-accent-gold flex items-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
        ) : (
          <div className="bg-charcoal p-2 rounded-full border border-primary-orange text-primary-orange flex items-center shrink-0">
            <Unlock className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="z-10 w-full">
        <div className="font-mono text-gray-500 mb-2 tracking-widest text-lg">•••• •••• •••• {card.id.substring(0,4) || '1234'}</div>
        <div className="flex justify-between items-end w-full">
           <div>
             <span className="text-gray-500 block text-xs uppercase tracking-wider font-bold mb-1">Limit</span>
             <span className="font-semibold text-lg text-off-white">₦{(card.limit || 0).toLocaleString()}</span>
           </div>
           <div>
             <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${
                isFrozen ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' : 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
             }`}>
               {card.status}
             </span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
