import React, { useState, useEffect, useRef } from 'react';

import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast } from './components/Toast';
import { NotificationSettings } from './components/NotificationSettings';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { Category, AuctionItem, UserBid, User, ActivityLog } from './types';
import { auctionService } from './services/auctionService';
import { PromoBanner } from './components/PromoBanner';
import { SideMenu } from './components/SideMenu';
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
  const { user, profile, isAdmin, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'admin' | 'product-detail' | 'login'>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSplash, setShowSplash] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  // Clear Local Storage for debugging

  const [isLoading, setIsLoading] = useState(true);
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
        <div className="flex flex-col gap-0 -mx-4 sm:mx-0 bg-white">
          {/* Mobile Style Search Bar */}
          <div className="bg-white">
            {/* Top Bar: Logo & Menu */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white">
              <h1 className="text-xl font-black italic tracking-tighter">
                <span className="text-orange-500">La Ganga</span>
                <span className="text-blue-600 ml-1">Phone RD</span>
              </h1>
              <div className="flex items-center gap-3">
                <button
                  className="relative p-1"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar Row */}
            <div className="px-4 pb-3 bg-white border-b border-gray-100">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  className="w-full bg-gray-100 border-none rounded-2xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-orange-500/20 text-gray-800 placeholder-gray-400"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-1.5 rounded-xl shadow-lg shadow-orange-500/30">
                  <Search className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Categories Tab */}
          <div className="flex overflow-x-auto no-scrollbar px-4 py-2 border-b border-gray-100 gap-6 bg-white">
            {['Inicio', 'Hogar', 'Hombre', 'Oficina', 'Industrial', 'Deporte', 'Mascotas'].map((cat, i) => (
              <button
                key={cat}
                className={`whitespace-nowrap pb-1 text-base font-bold transition-all relative ${(selectedCategory === cat || (cat === 'Inicio' && selectedCategory === 'Todos'))
                  ? 'text-black'
                  : 'text-gray-400'
                  }`}
                onClick={() => setSelectedCategory(cat === 'Inicio' ? 'Todos' : cat as Category)}
              >
                {cat}
                {(selectedCategory === cat || (cat === 'Inicio' && selectedCategory === 'Todos')) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Promo Bar */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white text-[11px] font-bold text-green-700">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Envío gratis</span>
            </div>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Reembolso por 30 días</span>
            </div>
          </div>

          <PromoBanner />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 bg-white">
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
      <div className="min-h-screen bg-white text-gray-900 font-sans pb-20 transition-colors duration-300">
        {currentView !== 'home' && (
          <Navbar
            currentView={currentView === 'profile' || currentView === 'admin' ? currentView : 'home'}
            onNavigate={(view) => setCurrentView(view)}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )}
        <main className={`max-w-7xl mx-auto bg-white min-h-screen ${currentView === 'home' ? 'px-0 pt-0' : 'px-4 sm:px-6 lg:px-8 pt-8'}`}>
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-6 safe-area-bottom lg:hidden">
          <button onClick={() => setCurrentView('home')} className="flex flex-col items-center gap-1 text-red-600">
            <div className="bg-red-600 w-8 h-8 rounded-2xl flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-[10px] font-bold">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-bold">Categorías</span>
          </button>
          <button onClick={() => setCurrentView('profile')} className="flex flex-col items-center gap-1 text-gray-500">
            <div className="relative">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">5</span>
            </div>
            <span className="text-[10px] font-bold">Tú</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="text-[10px] font-bold">Carrito</span>
          </button>
        </div>
        <Toast
          message={toast.message}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
          type={toast.type}
        />
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={signOut}
          isAdmin={isAdmin}
          user={user}
        />
      </div>
    </>
  );
};

export default App;