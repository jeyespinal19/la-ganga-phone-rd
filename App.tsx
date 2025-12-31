
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Home, Tag, User as UserIcon } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast } from './components/Toast';
import { Login } from './components/Login';
import { SplashScreen } from './components/SplashScreen';
import { Category, Product, User, CartItem } from './types';
import { productService } from './services/productService';
import { PromoBanner } from './components/PromoBanner';
import { SideMenu } from './components/SideMenu';
import { useAuth } from './contexts/AuthContext';

type SortOption = 'default' | 'price-asc' | 'price-desc';

const App: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'admin' | 'product-detail' | 'login' | 'cart'>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSplash, setShowSplash] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const previousUserRef = useRef<typeof user>(null);

  // Data State
  const [items, setItems] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  // --- Initialization ---

  // 1. Load Data
  useEffect(() => {
    const fetchData = async () => {
      const dbItems = await productService.getProducts();
      setItems(dbItems);
      const dbUsers = await productService.getUsers();
      setUsers(dbUsers);
      setIsLoading(false);
    };
    fetchData();

    // Load Cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // 2. Detect login and show splash screen
  useEffect(() => {
    if (user && !previousUserRef.current) {
      setShowSplash(true);
      setCurrentView('home');
    }
    previousUserRef.current = user;
  }, [user]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.remove('light');
    else document.documentElement.classList.add('light');
  }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);


  // --- Handlers ---

  const handleAddToCart = (item: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        updated = [...prev, { ...item, quantity }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    setToast({ visible: true, message: 'Producto agregado al carrito', type: 'success' });
  };

  const handleShare = async (item: Product) => {
    const shareData = {
      title: 'La Ganga Phone RD',
      text: `¡Mira este producto: ${item.name}! Precio: RD$ ${item.price.toLocaleString()}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { }
    } else {
      navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
      setToast({ visible: true, message: 'Enlace copiado', type: 'success' });
    }
  };

  const handleProductClick = (item: Product) => {
    setSelectedItemId(item.id);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handlers
  const handleAddItem = async (newItem: Omit<Product, 'id'>) => {
    await productService.addProduct(newItem);
    setToast({ visible: true, message: 'Producto añadido', type: 'success' });
    const updated = await productService.getProducts();
    setItems(updated);
  };

  const handleEditItem = async (id: string, updatedFields: Partial<Product>) => {
    await productService.updateProduct(id, updatedFields);
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    setToast({ visible: true, message: 'Producto actualizado', type: 'success' });
  };

  const handleDeleteItem = async (id: string) => {
    await productService.deleteProduct(id);
    setItems(prev => prev.filter(i => i.id !== id));
    setToast({ visible: true, message: 'Producto eliminado', type: 'success' });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setToast({ visible: true, message: 'Usuario eliminado', type: 'success' });
  }

  // --- Filtering ---
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specs.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.brand === ('Oukitel' as any) || item.brand === ('Samsung' as any) || item.brand === ('Xiaomi' as any); // Fallback logic for now as mapping is loose

    // Better category logic
    if (selectedCategory === 'Todos') return matchesSearch;
    if (selectedCategory === 'Samsung' || selectedCategory === 'Xiaomi' || selectedCategory === 'Oukitel') {
      return matchesSearch && item.brand === selectedCategory;
    }
    return matchesSearch; // For other categories not strictly in brand, maybe filter by tag later
  });

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
      return <UserProfile allItems={items as any} onBack={() => setCurrentView('home')} />; // Force cast for now, will fix Profile later
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
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onDeleteUser={handleDeleteUser}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    if (currentView === 'product-detail' && selectedItem) {
      return (
        <ProductDetail
          item={selectedItem}
          onBack={() => setCurrentView('home')}
          onAddToCart={handleAddToCart}
          onShare={handleShare}
        />
      );
    }

    return (
      <>
        <div className="flex flex-col gap-0 -mx-4 sm:mx-0 bg-white">
          {/* Header */}
          <div className="bg-white">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white">
              <h1 className="text-xl font-black italic tracking-tighter">
                <span className="text-orange-500">La Ganga</span>
                <span className="text-blue-600 ml-1">Phone RD</span>
              </h1>
              <div className="flex items-center gap-3">
                <button className="relative p-1">
                  <ShoppingCart className="text-gray-700 w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
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

            {/* Search */}
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
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto no-scrollbar px-4 py-2 border-b border-gray-100 gap-6 bg-white">
            {['Inicio', 'Samsung', 'Xiaomi', 'Oukitel', 'Accesorios'].map((cat, i) => (
              <button
                key={cat}
                className={`whitespace-nowrap pb-1 text-base font-bold transition-all relative ${(selectedCategory === cat || (cat === 'Inicio' && selectedCategory === 'Todos'))
                  ? 'text-black'
                  : 'text-gray-400'
                  }`}
                onClick={() => setSelectedCategory(cat === 'Inicio' ? 'Todos' : cat as any)}
              >
                {cat}
                {(selectedCategory === cat || (cat === 'Inicio' && selectedCategory === 'Todos')) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black rounded-full" />
                )}
              </button>
            ))}
          </div>

          <PromoBanner />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 bg-white pb-24">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onShare={handleShare}
                onClick={handleProductClick}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>No se encontraron resultados</p>
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
        <main className={`max-w-7xl mx-auto bg-white min-h-screen ${currentView === 'home' ? 'px-0 pt-0' : 'px-4 sm:px-6 lg:px-8 pt-8'}`}>
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-6 safe-area-bottom lg:hidden z-40">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-red-600' : 'text-gray-400'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <Tag className="w-6 h-6" />
            <span className="text-[10px] font-bold">Ofertas</span>
          </button>
          <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-red-600' : 'text-gray-400'}`}>
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Tú</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 relative">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
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