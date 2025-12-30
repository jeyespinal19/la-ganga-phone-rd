
export interface AuctionItem {
  id: string;
  name: string;
  brand: string;
  specs: string;
  currentBid: number;
  timeLeft: string;
  imageDetails: string; // Used to seed the random image
  reservePrice?: number;
}

export type Category = 'Todos' | 'Oukitel' | 'Samsung' | 'Xiaomi';

export interface BidUpdate {
  itemId: string;
  newBid: number;
}

export interface BidResult {
  success: boolean;
  message: string;
  currentPrice?: number;
}

export interface UserBid {
  itemId: string;
  itemName: string;
  amount: number;
  timestamp: string; // ISO string
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'vip';
  status: 'active' | 'pending' | 'banned';
  lastSeen: string;
  avatar: string;
}

export interface ActivityLog {
  id: string;
  type: 'bid' | 'system' | 'new_item' | 'user_action';
  message: string;
  timestamp: string;
  user?: string;
  amount?: number;
  itemId?: string;
}

export interface BidHistoryItem {
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;
}