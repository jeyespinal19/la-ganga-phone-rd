
import { MOCK_ITEMS, MOCK_USERS } from '../constants';
import { BidUpdate, BidResult, BidHistoryItem, AuctionItem } from '../types';

// List of simulated bot names provided by user
const BOT_NAMES = [
  "Juan Pérez", "María González", "Carlos Rodríguez", "Ana Martínez", "Luis Fernández", "Laura Sánchez", 
  "Miguel Torres", "Sofía Ramírez", "Pedro Flores", "Daniela Cruz", "Andrés Morales", "Valentina Ortiz", 
  "Diego Herrera", "Paula Ríos", "Javier Navarro", "Camila Vega", "Fernando Castillo", "Lucía Méndez", 
  "Alejandro Paredes", "Renata Campos", "Sergio Fuentes", "Mariana Cabrera", "Rodrigo Salinas", "Elena Domínguez", 
  "Marco Lozano", "Natalia Villar", "Esteban Cordero", "Abril Montoya", "Iván Soto", "Karla Figueroa", 
  "Tomás Aguilar", "Brenda Valdés", "Raúl Peñaloza", "Mónica Zúñiga", "Óscar Castañeda", "Patricia Escobar", 
  "Nicolás Acevedo", "Diana Peralta", "Adolfo Tapia", "Beatriz Alcántara", "Samuel Barrios", "Inés Corona", 
  "Rubén Galindo", "Yolanda Murillo", "Cristian Robles", "Jimena Ochoa", "Alberto Naranjo", "Noelia Ponce", 
  "Héctor Macías", "Roxana Villalobos", "Emilio Quintana", "Sara Hurtado", "Fabián Beltrán", "Teresa Ballesteros", 
  "Joaquín Reynoso", "Paulina Arce", "Israel Becerra", "Lorena Trejo", "Martín Ureña", "Andrea Espinoza", 
  "Kevin Solís", "Estela Quintero", "Ángel Montalvo", "Rebeca Palacios", "Omar Cifuentes", "Lidia Saucedo", 
  "Víctor Yáñez", "Alejandra Rangel", "Germán Olvera", "Melissa Carbajal", "Sebastián Téllez", "Frida Munguía", 
  "Eduardo Ojeda", "Pamela Rosales", "Joel Camacho", "Karina Meza", "Mario Patiño", "Susana Briseño", 
  "Daniel Escamilla", "Jessica Girón", "Ricardo Padilla", "Verónica Luna", "Pablo Varela", "Tamara Ibarra", 
  "Erik Cortés", "Silvia Barragán", "Bruno Acosta", "Nerea Leal", "Leonardo Godínez", "Aitana Rueda", 
  "Alfonso Arriaga", "Marisol Fraga", "Celular Manía", "Phone Center", "MoviTech", "Zona Celular", 
  "SmartPhone City", "Móvil Express", "Phone House", "Celular Shop", "Movilandia", "Click Móvil", 
  "Planet Phone", "ElectroMóvil", "City Phone", "Móvil Plus", "Phone World", "Celular Point", "Smart Mobile", 
  "Móvil Zone", "Phone Market", "Doctor Celular", "Móvil Store", "Phone Pro", "Celular Directo", "Power Phone", 
  "Móvil Net", "Phone Factory", "Celular Total", "SmartZone Móvil", "Phone & Tech", "Móvil Max", "Phone Lab", 
  "Celular Hub", "Phone Station", "Móvil Click", "Phone Galaxy", "Celular Power", "Móvil Digital", "Phone Star", 
  "Móvil House", "Phone Plaza", "Celular Box", "Phone Connect", "Móvil Shop", "Phone Xpress", "Celular Tech", 
  "Móvil Store 24", "Phone City", "Celular One"
];

/**
 * Simulates a WebSocket connection for real-time auction updates.
 * In a real application, this would connect to a ws:// or wss:// endpoint.
 * Now includes persistence to localStorage to simulate a real database.
 */
class MockSocketService {
  private listeners: ((update: BidUpdate) => void)[] = [];
  private interval: number | null = null;
  private currentBids: Map<string, number> = new Map();
  private reservePrices: Map<string, number> = new Map();
  private bidHistory: Map<string, BidHistoryItem[]> = new Map();
  private simulationEnabled: boolean = true; // New flag for controlling bots
  private MIN_INCREMENT = 50;
  private STORAGE_KEY = 'app_mock_server_data';

  constructor() {
    // 1. Try to load existing state (bids, history)
    const loaded = this.loadFromStorage();
    
    // 2. Sync MOCK_ITEMS to ensure we have all items and LATEST reserve prices
    // This fixes the issue where old storage data might miss reserve prices
    MOCK_ITEMS.forEach(item => {
      // If item doesn't exist in storage state, add it
      if (!this.currentBids.has(item.id)) {
          this.currentBids.set(item.id, item.currentBid);
          this.generateMockHistory(item.id, item.currentBid);
      }

      // ALWAYS update reserve price from constants to ensure logic uses current values
      if (item.reservePrice) {
          this.reservePrices.set(item.id, item.reservePrice);
      }
    });

    if (!loaded) {
      console.log('[MockServer] Initialized from constants.');
    } else {
      console.log('[MockServer] Data loaded and synced.');
    }
    
    this.saveToStorage();
  }

  // --- Persistence Helpers ---

  private saveToStorage() {
    try {
        const data = {
            currentBids: Array.from(this.currentBids.entries()),
            reservePrices: Array.from(this.reservePrices.entries()),
            bidHistory: Array.from(this.bidHistory.entries()),
            simulationEnabled: this.simulationEnabled // Save simulation state
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('[MockServer] Failed to save state:', e);
    }
  }

  private loadFromStorage(): boolean {
    try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            this.currentBids = new Map(parsed.currentBids);
            
            // We load reserve prices, but the constructor loop above will merge updates from MOCK_ITEMS
            if (parsed.reservePrices) {
                this.reservePrices = new Map(parsed.reservePrices);
            }
            
            this.bidHistory = new Map(parsed.bidHistory);
            // Load simulation state if exists, default to true
            this.simulationEnabled = parsed.simulationEnabled !== undefined ? parsed.simulationEnabled : true;
            return true;
        }
    } catch (e) {
        console.error('[MockServer] Failed to load state:', e);
    }
    return false;
  }

  // --- Logic ---

  private generateMockHistory(itemId: string, currentPrice: number) {
    const history: BidHistoryItem[] = [];
    let price = currentPrice;
    const count = Math.floor(Math.random() * 5) + 2; // 2 to 7 previous bids

    for (let i = 0; i < count; i++) {
        // Decrease price to simulate past
        price = price - 50;
        if (price <= 0) break;

        const randomName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];

        history.push({
            userId: `bot-${Math.random()}`,
            userName: randomName,
            amount: price,
            timestamp: new Date(Date.now() - (i + 1) * 1000 * 60 * 30).toISOString() // Every 30 mins back
        });
    }
    // Store sorted by time descending (newest first)
    this.bidHistory.set(itemId, history);
  }

  /**
   * Registers a new item dynamically added by the admin to the mock server state.
   * Safe to call multiple times (idempotent).
   */
  registerNewItem(item: AuctionItem) {
      if (this.currentBids.has(item.id)) {
          // If already exists, we don't reset history, but we ensure price matches if it's higher
          const serverPrice = this.currentBids.get(item.id) || 0;
          if (item.currentBid > serverPrice) {
               this.currentBids.set(item.id, item.currentBid);
          }
          // Update reserve price just in case it changed
          if (item.reservePrice) {
            this.reservePrices.set(item.id, item.reservePrice);
          }
          this.saveToStorage();
          return;
      }

      // New registration
      this.currentBids.set(item.id, item.currentBid);
      if (item.reservePrice) {
        this.reservePrices.set(item.id, item.reservePrice);
      }
      
      // Initialize history with start price
      const startHistory: BidHistoryItem = {
          userId: 'system',
          userName: 'Precio Inicial',
          amount: item.currentBid,
          timestamp: new Date().toISOString()
      };
      this.bidHistory.set(item.id, [startHistory]);
      this.saveToStorage();
      
      console.info(`[Server Log] Item registered: ${item.name} (${item.id})`);
  }

  /**
   * Subscribes to bid updates.
   * Returns a cleanup function to unsubscribe.
   */
  subscribe(callback: (update: BidUpdate) => void) {
    this.listeners.push(callback);
    
    // Start simulation if this is the first listener AND simulation is enabled
    if (!this.interval && this.simulationEnabled) {
      this.startSimulation();
    }

    // Return unsubscribe function
    return () => {
        this.listeners = this.listeners.filter(l => l !== callback);
        if (this.listeners.length === 0) {
            this.stopSimulation();
        }
    };
  }

  /**
   * Returns the bid history for a specific item
   */
  getBidHistory(itemId: string): BidHistoryItem[] {
    const history = this.bidHistory.get(itemId) || [];
    return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Simulates sending a user bid to the server with VALIDATION.
   * Returns a Promise that resolves to the result of the operation.
   */
  sendBid(itemId: string, amount: number): Promise<BidResult> {
    return new Promise((resolve) => {
      // Simulate network latency (100-300ms)
      const latency = Math.floor(Math.random() * 200) + 100;

      setTimeout(() => {
        const currentServerBid = this.currentBids.get(itemId);

        // Validation 1: Item Existence
        if (currentServerBid === undefined) {
          const errorMsg = `Invalid Bid Attempt: Item ${itemId} does not exist.`;
          console.error(`[Server Log] ${errorMsg}`);
          resolve({ success: false, message: 'El producto no existe o ha sido eliminado.' });
          return;
        }

        // Validation 2: Bid Amount vs Current Price + Increment
        const requiredBid = currentServerBid + this.MIN_INCREMENT;
        
        if (amount < requiredBid) {
          const errorMsg = `Invalid Bid Attempt: Bid DOP ${amount} is lower than required DOP ${requiredBid} for item ${itemId}.`;
          console.warn(`[Server Log] ${errorMsg}`);
          
          resolve({ 
            success: false, 
            message: `La puja debe ser de al menos DOP ${requiredBid.toLocaleString()}`,
            currentPrice: currentServerBid
          });
          return;
        }

        // --- Success Path ---
        console.info(`[Server Log] Valid Bid: Accepted DOP ${amount} for item ${itemId}.`);
        
        // Update "server" state
        this.currentBids.set(itemId, amount);

        // Add to history
        const newHistoryItem: BidHistoryItem = {
            userId: 'current-user',
            userName: 'Tú', // In a real app, this comes from auth context
            amount: amount,
            timestamp: new Date().toISOString()
        };
        const currentHistory = this.bidHistory.get(itemId) || [];
        this.bidHistory.set(itemId, [newHistoryItem, ...currentHistory]);

        // Save State
        this.saveToStorage();

        // Broadcast update to all clients (including self)
        const update: BidUpdate = {
          itemId,
          newBid: amount
        };
        this.listeners.forEach(l => l(update));

        resolve({ success: true, message: 'Puja aceptada correctamente' });
      }, latency);
    });
  }

  public isSimulationRunning() {
    return this.simulationEnabled;
  }

  public setSimulationEnabled(enabled: boolean) {
    this.simulationEnabled = enabled;
    this.saveToStorage();
    if (enabled) {
      if (!this.interval && this.listeners.length > 0) {
        this.startSimulation();
      }
    } else {
      this.stopSimulation();
    }
  }

  private startSimulation() {
    // Prevent double intervals
    if (this.interval) return;
    
    // Simulate an incoming bid every 2 seconds
    this.interval = window.setInterval(() => {
      // Pick a random item from ALL items known to server
      const itemIds = Array.from(this.currentBids.keys());
      if (itemIds.length === 0) return;

      const randomId = itemIds[Math.floor(Math.random() * itemIds.length)];
      
      const currentBid = this.currentBids.get(randomId) || 0;
      const reservePrice = this.reservePrices.get(randomId);

      // --- STOP CONDITION LOGIC ---
      // Check who is currently winning
      const history = this.bidHistory.get(randomId) || [];
      const topBidder = history[0]; // Most recent bid

      // 1. Prevent Bot vs Bot Competition
      // If the current top bidder is a bot, skip this item.
      if (topBidder && topBidder.userId.startsWith('bot-')) {
          return;
      }

      // 2. STOP AT RESERVE PRICE
      // If the price has reached or exceeded the reserve, the bot MUST STOP.
      // This gives the real user the win (or opportunity to win) without bot interference.
      if (reservePrice && currentBid >= reservePrice) {
          // If a real user is already the top bidder, or if the price is just maxed out.
          // Bots do not bid above reserve price.
          if (topBidder?.userId === 'current-user') {
             console.log(`[Simulation] Bot stopped on ${randomId}: User reached reserve (DOP ${currentBid}).`);
          }
          return;
      }
      
      // Calculate new bid (FIXED INCREMENT +50)
      const newBid = currentBid + 50;

      // Update server state
      this.currentBids.set(randomId, newBid);

      // Add to history using provided BOT_NAMES
      const randomName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      
      const newHistoryItem: BidHistoryItem = {
        userId: `bot-${Math.random()}`,
        userName: randomName,
        amount: newBid,
        timestamp: new Date().toISOString()
      };
      const currentHistory = this.bidHistory.get(randomId) || [];
      this.bidHistory.set(randomId, [newHistoryItem, ...currentHistory]);
      
      // Save state
      this.saveToStorage();

      // Emit event
      const update: BidUpdate = {
        itemId: randomId,
        newBid: newBid
      };

      this.listeners.forEach(l => l(update));

    }, 2000);
  }

  private stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export const mockSocket = new MockSocketService();
