import React, { useState, useEffect, useRef } from 'react';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast } from './components/Toast';
import { NotificationSettings } from './components/NotificationSettings';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { Category, AuctionItem, UserBid, User, ActivityLog } from './types';;
import { auctionService } from './services/auctionService';
import { useAuth } from './contexts/AuthContext';

// Helper for sorting by time
const parseTimeLeftForSort = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleanStr = timeStr.replace('restantes', '').trim();
  let totalSeconds = 0;

  const daysMatch = cleanStr.match(/(\d+)\s*d/);
  if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 86400;

  const hoursMatch = cleanStr.match(/(\d+)\s*h/);
  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;

  const minutesMatch = cleanStr.match(/(\d+)\s*m/);
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;

  if (totalSeconds === 0 && cleanStr.includes('m') && !minutesMatch) {
    const m = parseInt(cleanStr);
    if (!isNaN(m)) totalSeconds = m * 60;
  }
  return totalSeconds;
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'time-asc';

const App: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'admin' | 'product-detail' | 'login'>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSplash, setShowSplash] = useState(false);
  const previousUserRef = useRef<typeof user>(null);

  // Data State (Fetched from Supabase)
  const [items, setItems] = useState<AuctionItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [users, setUsers] = useState<User[]>([]);
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // Simulation State
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  // Sorting Stability State
  const [stableItemIds, setStableItemIds] = useState<string[]>([]);
  const [lastUserAction, setLastUserAction] = useState(0);

  // Theme & Toast
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  const categories: Category[] = ['Todos', 'Oukitel', 'Samsung', 'Xiaomi'];

  // --- Initialization ---

  // 1. Load Data
  useEffect(() => {
    const fetchData = async () => {
      const dbItems = await auctionService.getItems();
      setItems(dbItems);
      // Initialize stable order
      setStableItemIds(dbItems.map(i => i.id));

      const dbUsers = await auctionService.getUsers();
      setUsers(dbUsers);
    };
    fetchData();

    // Load local user bids history (client-side only for now)
    const savedBids = localStorage.getItem('userBids');
    if (savedBids) setUserBids(JSON.parse(savedBids));
  }, []);

  // 2. Realtime Subscriptions
  useEffect(() => {
    const unsubscribe = auctionService.subscribeToChanges(
      // On Product Change (Update Price)
      (payload) => {
        setItems(prev => prev.map(item => {
          if (item.id === payload.new.id) {
            return {
              ...item,
              currentBid: Number(payload.new.current_bid),
              // We could also update timeLeft here if we parse ends_at again
            };
          }
          return item;
        }));
      },
      // On New Bid (Log)
      (payload) => {
        const item = itemsRef.current.find(i => i.id === payload.new.product_id);
        if (item) {
          const newLog: ActivityLog = {
            id: payload.new.id,
            type: 'bid',
            message: `Nueva puja de DOP ${Number(payload.new.amount).toLocaleString()} en ${item.name}`,
            timestamp: payload.new.created_at,
            amount: Number(payload.new.amount),
            itemId: item.id
          };
          setActivityLog(prev => [newLog, ...prev].slice(0, 50));
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Manage Simulation Effect
  useEffect(() => {
    auctionService.toggleSimulation(isSimulationActive, items);
  }, [isSimulationActive, items]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.remove('light');
    else document.documentElement.classList.add('light');
  }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 4. Detect login and show splash screen
  useEffect(() => {
    if (user && !previousUserRef.current) {
      // User just logged in
      setShowSplash(true);
      setCurrentView('home');
    }
    previousUserRef.current = user;
  }, [user]);


  // --- Sorting Logic ---
  useEffect(() => {
    const currentItems = itemsRef.current;
    let result = currentItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specs.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || item.brand === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.currentBid - b.currentBid);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.currentBid - a.currentBid);
    } else if (sortBy === 'time-asc') {
      result.sort((a, b) => parseTimeLeftForSort(a.timeLeft) - parseTimeLeftForSort(b.timeLeft));
    }

    setStableItemIds(result.map(i => i.id));
  }, [searchTerm, selectedCategory, sortBy, lastUserAction, items.length]);


  // --- Handlers ---

  const handlePlaceBid = async (item: AuctionItem, customAmount?: number) => {
    const bidIncrement = 50;
    const minNextBid = item.currentBid + bidIncrement;
    let proposedBidAmount = customAmount !== undefined ? customAmount : minNextBid;

    if (proposedBidAmount < minNextBid) {
      setToast({ visible: true, message: `La puja mínima es DOP ${minNextBid.toLocaleString()}`, type: 'error' });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setToast({ visible: true, message: 'Debes iniciar sesión para pujar', type: 'error' });
      setCurrentView('login');
      return;
    }

    // Call Supabase Service
    const userId = user.id;
    const userName = profile?.name || 'Usuario';

    const result = await auctionService.placeBid(item.id, proposedBidAmount, userId, userName);

    if (result.success) {
      // Track locally
      const newBid: UserBid = {
        itemId: item.id,
        itemName: item.name,
        amount: proposedBidAmount,
        timestamp: new Date().toISOString()
      };
      const updatedBids = [...userBids, newBid];
      setUserBids(updatedBids);
      localStorage.setItem('userBids', JSON.stringify(updatedBids));

      setLastUserAction(Date.now());
      setToast({ visible: true, message: `¡Puja de DOP ${proposedBidAmount.toLocaleString()} realizada!`, type: 'success' });
    } else {
      setToast({ visible: true, message: result.message, type: 'error' });
    }
  };

  const handleShare = async (item: AuctionItem) => {
    const shareData = {
      title: 'La Ganga Phone RD',
      text: `¡Mira esta subasta: ${item.name}! Precio actual: DOP ${item.currentBid.toLocaleString()}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
      setToast({ visible: true, message: 'Enlace copiado al portapapeles', type: 'success' });
    }
  };

  const handleProductClick = (item: AuctionItem) => {
    setSelectedItemId(item.id);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddItem = async (newItem: Omit<AuctionItem, 'id'>) => {
    await auctionService.addItem(newItem);
    setToast({ visible: true, message: 'Producto añadido (Recargar para ver)', type: 'success' });
    // In a full implementation, we'd wait for the realtime event or refetch
    const updated = await auctionService.getItems();
    setItems(updated);
    setLastUserAction(Date.now());
  };

  const handleEditItem = async (id: string, updatedFields: Partial<AuctionItem>) => {
    try {
      await auctionService.updateItem(id, updatedFields);

      // Update local state
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...updatedFields } : item
      ));

      setLastUserAction(Date.now());
      setToast({ visible: true, message: 'Producto actualizado exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error updating item:', error);
      setToast({ visible: true, message: 'Error al actualizar producto', type: 'error' });
    }
  };

  const handleReorderItems = (newOrder: AuctionItem[]) => {
    // Visual only for now
    setItems(newOrder);
    setLastUserAction(Date.now());
  };

  const handleDeleteItem = async (id: string) => {
    await auctionService.deleteItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    setLastUserAction(Date.now());
    setToast({ visible: true, message: 'Producto eliminado', type: 'success' });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setToast({ visible: true, message: 'Usuario eliminado', type: 'success' });
  }

  const handleToggleSimulation = () => {
    setIsSimulationActive(!isSimulationActive);
    setToast({ visible: true, message: !isSimulationActive ? 'Simulación activada' : 'Simulación pausada', type: 'success' });
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  const renderContent = () => {
    if (currentView === 'login') {
      return <Login onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'profile') {
      if (!user) {
        setCurrentView('login');
        return null;
      }
      return <UserProfile userBids={userBids} allItems={items} onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'admin') {
      if (!isAdmin) {
        setToast({ visible: true, message: 'No tienes permisos de administrador', type: 'error' });
        setCurrentView('home');
        return null;
      }
      return (
        <AdminDashboard
          items={items}
          users={users}
          activityLog={activityLog}
          isSimulationActive={isSimulationActive}
          onToggleSimulation={handleToggleSimulation}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onReorderItems={handleReorderItems}
          onDeleteItem={handleDeleteItem}
          onDeleteUser={handleDeleteUser}
          onBack={() => setCurrentView('home')}
        />
      );
    }
    if (currentView === 'settings') {
      return <NotificationSettings onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'product-detail' && selectedItem) {
      return (
        <ProductDetail
          item={selectedItem}
          onBack={() => setCurrentView('home')}
          onPlaceBid={handlePlaceBid}
          onShare={handleShare}
        />
      );
    }

    return (
      <>
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
            <div className="relative flex-1 group max-w-2xl">
              <div className="absolute inset-0 bg-app-neon-cyan blur-2xl opacity-5 group-focus-within:opacity-15 transition-opacity" />
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/30 group-focus-within:text-app-neon-cyan transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-6 py-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl leading-5 text-white placeholder-white/20 focus:outline-none focus:bg-black/60 focus:border-app-neon-cyan/50 focus:ring-1 focus:ring-app-neon-cyan/50 font-bold transition-all shadow-2xl"
                placeholder="Busca tu próximo equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <SlidersHorizontal className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 group-hover:text-app-neon-cyan transition-colors pointer-events-none z-10" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-black/40 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] py-4 pl-11 pr-10 rounded-2xl focus:outline-none focus:border-app-neon-cyan cursor-pointer hover:bg-black/60 transition-all shadow-xl"
                >
                  <option value="default">Relevancia</option>
                  <option value="price-asc">Precio: ↑</option>
                  <option value="price-desc">Precio: ↓</option>
                  <option value="time-asc">Pronto Final</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-app-neon-cyan transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (cat !== null && (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border
                  ${selectedCategory === cat
                    ? 'bg-app-neon-cyan text-black border-app-neon-cyan shadow-[0_0_25px_rgba(0,229,255,0.4)] scale-105'
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
              >
                {cat}
              </button>
            )))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {stableItemIds.length > 0 ? (
            stableItemIds.map((id) => {
              const item = items.find(i => i.id === id);
              if (!item) return null;
              const isWinning = userBids.some(bid => bid.itemId === item.id && bid.amount === item.currentBid);

              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  isWinning={isWinning}
                  onPlaceBid={handlePlaceBid}
                  onShare={handleShare}
                  onClick={handleProductClick}
                />
              )
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-app-muted">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>No se encontraron resultados para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} duration={3000} />
      )}
      <div className="min-h-screen bg-app-bg text-app-text font-sans pb-10 transition-colors duration-300">
        <Navbar
          currentView={currentView === 'profile' || currentView === 'admin' ? currentView : 'home'}
          onNavigate={(view) => setCurrentView(view)}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {renderContent()}
        </main>
        <Toast
          message={toast.message}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
          type={toast.type}
        />
      </div>
    </>
  );
};

export default App;