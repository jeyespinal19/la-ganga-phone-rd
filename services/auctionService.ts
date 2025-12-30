
import { supabase } from './supabase';
import { AuctionItem, BidHistoryItem, BidResult, User, ActivityLog } from '../types';
import { MOCK_ITEMS, MOCK_USERS } from '../constants';
import { mockSocket } from './mockSocket';

// Helper to format DB timestamp to "12d 3h restantes"
const formatTimeLeft = (endsAt: string): string => {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, (end - now) / 1000);

  if (diff <= 0) return 'Finalizado';

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);

  if (d > 0) return `${d}d ${h}h restantes`;
  if (h > 0) return `${h}h ${m}m restantes`;
  return `${m}m restantes`;
};

// Bot names for simulation
const BOT_NAMES = [
  "Juan Pérez", "María González", "Carlos Rodríguez", "Ana Martínez", "Luis Fernández", "Laura Sánchez",
  "Miguel Torres", "Sofía Ramírez", "Pedro Flores", "Daniela Cruz", "Andrés Morales", "Valentina Ortiz",
  "Diego Herrera", "Paula Ríos", "Javier Navarro", "Camila Vega", "Fernando Castillo", "Lucía Méndez",
  "Alejandro Paredes", "Renata Campos", "Sergio Fuentes", "Mariana Cabrera", "Rodrigo Salinas", "Elena Domínguez"
];

class AuctionService {
  private simulationInterval: number | null = null;
  private useMockFallback = false;

  // --- Data Fetching ---

  async getItems(): Promise<AuctionItem[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('ends_at', { ascending: true });

      if (error) throw error;

      this.useMockFallback = false;

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        specs: item.specs || '',
        currentBid: Number(item.current_bid),
        reservePrice: item.reserve_price ? Number(item.reserve_price) : undefined,
        imageDetails: item.image_details,
        timeLeft: formatTimeLeft(item.ends_at)
      }));

    } catch (err) {
      console.warn('Supabase connection failed, falling back to Mock Data:', err);
      this.useMockFallback = true;
      // Ensure mock socket has the items registered
      MOCK_ITEMS.forEach(item => mockSocket.registerNewItem(item));
      return MOCK_ITEMS;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      if (this.useMockFallback) throw new Error('Using fallback');

      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;

      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        avatar: u.avatar_seed || '1',
        lastSeen: u.last_seen
      }));

    } catch (err) {
      return MOCK_USERS;
    }
  }

  async getBidHistory(itemId: string): Promise<BidHistoryItem[]> {
    try {
      if (this.useMockFallback) {
        return mockSocket.getBidHistory(itemId);
      }

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((bid: any) => ({
        userId: bid.user_id || 'bot',
        userName: bid.user_name,
        amount: Number(bid.amount),
        timestamp: bid.created_at
      }));

    } catch (err) {
      return mockSocket.getBidHistory(itemId);
    }
  }

  // --- Actions ---

  async placeBid(itemId: string, amount: number, userId: string | null, userName: string): Promise<BidResult> {
    // If we are in fallback mode, delegate to mock socket
    if (this.useMockFallback) {
      return mockSocket.sendBid(itemId, amount);
    }

    try {
      // 1. Validate against current DB state
      const { data: product, error: fetchError } = await supabase.from('products').select('current_bid').eq('id', itemId).single();

      if (fetchError || !product) throw new Error('Product not found');

      if (amount <= Number(product.current_bid)) {
        return {
          success: false,
          message: `La puja debe ser mayor a DOP ${Number(product.current_bid).toLocaleString()}`,
          currentPrice: Number(product.current_bid)
        };
      }

      // 2. Insert Bid
      const { error } = await supabase.from('bids').insert({
        product_id: itemId,
        user_id: userId,
        user_name: userName,
        amount: amount
      });

      if (error) throw error;

      return { success: true, message: 'Puja aceptada' };

    } catch (err) {
      console.error('Bid error, falling back to mock:', err);
      // Even if DB fails, try mock for UI responsiveness if we switched modes dynamically
      return mockSocket.sendBid(itemId, amount);
    }
  }

  async addItem(item: Omit<AuctionItem, 'id'>) {
    if (this.useMockFallback) {
      // Generate a fake ID for the mock item
      const newItem = { ...item, id: `mock-${Date.now()}` };
      mockSocket.registerNewItem(newItem);
      return;
    }

    const daysMatch = item.timeLeft.match(/(\d+)d/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 7;
    const endsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('products').insert({
      name: item.name,
      brand: item.brand,
      specs: item.specs,
      current_bid: item.currentBid,
      reserve_price: item.reservePrice,
      image_details: item.imageDetails,
      ends_at: endsAt,
      status: 'active'
    });

    if (error) console.error('Add item error:', error);
  }

  async updateItem(id: string, updates: Partial<Omit<AuctionItem, 'id'>>) {
    if (this.useMockFallback) {
      console.log('Update item in mock mode:', id, updates);
      return;
    }

    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.specs !== undefined) updateData.specs = updates.specs;
      if (updates.currentBid !== undefined) updateData.current_bid = updates.currentBid;
      if (updates.reservePrice !== undefined) updateData.reserve_price = updates.reservePrice;
      if (updates.imageDetails !== undefined) updateData.image_details = updates.imageDetails;

      if (updates.timeLeft !== undefined) {
        const daysMatch = updates.timeLeft.match(/(\d+)d/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 7;
        updateData.ends_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

    } catch (err) {
      console.error('Update item error:', err);
      throw err;
    }
  }

  async deleteItem(id: string) {
    if (this.useMockFallback) return;
    await supabase.from('products').delete().eq('id', id);
  }

  // --- Realtime Subscription ---

  subscribeToChanges(
    onProductChange: (payload: any) => void,
    onBidChange: (payload: any) => void
  ) {
    // If fallback is active, subscribe to mock socket
    // We check a flag or just try both? 
    // Best approach: If getItems failed, we rely on mockSocket.

    // We can always subscribe to mockSocket as well, but filter events?
    // Let's rely on the flag set during getItems.

    if (this.useMockFallback) {
      return mockSocket.subscribe((update) => {
        // Convert mock update format to Supabase payload format to keep App.tsx happy
        // Or simpler: App.tsx expects specific payload structure.
        // We'll just hook into the mock socket directly in App.tsx if needed, 
        // but here we are adapting.

        // Update items (Product Change)
        onProductChange({
          new: {
            id: update.itemId,
            current_bid: update.newBid
          }
        });

        // Update activity (New Bid)
        onBidChange({
          new: {
            id: `bid-${Date.now()}`,
            product_id: update.itemId,
            amount: update.newBid,
            created_at: new Date().toISOString()
          }
        });
      });
    }

    const channel = supabase.channel('public:auction')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        onProductChange(payload);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, (payload) => {
        onBidChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // --- Bot Simulation Logic (Running Locally but Inserting to DB) ---

  toggleSimulation(isActive: boolean, items: AuctionItem[]) {
    // If using fallback, delegate to mock socket's simulation
    if (this.useMockFallback) {
      mockSocket.setSimulationEnabled(isActive);
      return;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (isActive) {
      console.log('Starting DB Simulation...');
      this.simulationInterval = window.setInterval(async () => {
        if (items.length === 0) return;

        // Pick random item
        const randomItem = items[Math.floor(Math.random() * items.length)];

        // Stop if reserve met
        if (randomItem.reservePrice && randomItem.currentBid >= randomItem.reservePrice) return;

        // Check last bidder
        const history = await this.getBidHistory(randomItem.id);
        if (history.length > 0 && !history[0].userId) {
          return;
        }

        const newBid = randomItem.currentBid + 50;
        const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];

        await this.placeBid(randomItem.id, newBid, null, botName);

      }, 3000);
    }
  }
}

export const auctionService = new AuctionService();
