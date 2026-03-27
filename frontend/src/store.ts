import { create } from 'zustand';

export interface Card {
  id: string;
  merchant_name: string;
  limit: number;
  status: 'frozen' | 'active';
}

export interface Alert {
  id: string;
  message: string;
  card_id: string;
  amount: number;
  merchant: string;
}

interface AppState {
  balance: number;
  cards: Card[];
  alerts: Alert[];
  setBalance: (balance: number) => void;
  setCards: (cards: Card[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  balance: 0,
  cards: [],
  alerts: [],
  setBalance: (balance) => set({ balance }),
  setCards: (cards) => set({ cards }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));
