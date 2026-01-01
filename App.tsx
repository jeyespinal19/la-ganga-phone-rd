
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
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderHistory } from './components/OrderHistory';
import { Category, Product, User, CartItem } from './types';
import { productService } from './services/productService';
import { PromoBanner } from './components/PromoBanner';
import { SideMenu } from './components/SideMenu';
import { useAuth } from './contexts/AuthContext';

type SortOption = 'default' | 'price-asc' | 'price-desc';

const App: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'admin' | 'product-detail' | 'login' | 'cart' | 'checkout' | 'orders'>('home');
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  // Handle Dark Mode Class & Persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

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

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('home');
      setToast({ visible: true, message: 'Sesión cerrada correctamente', type: 'success' });
    } catch (error) {
      console.error('Logout error:', error);
      setToast({ visible: true, message: 'Error al cerrar sesión', type: 'error' });
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setToast({ visible: true, message: 'Usuario eliminado', type: 'success' });
  };

  // --- Filtering ---
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCategory === 'Todos' || selectedCategory === 'Inicio') {
      return matchesSearch;
    }

    // Dynamic brand/category matching
    return matchesSearch && item.brand.toLowerCase() === selectedCategory.toLowerCase();
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
          onLogout={handleLogout}
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

    if (currentView === 'cart') {
      return (
        <Cart
          cartItems={cart}
          onUpdateQuantity={(id, qty) => {
            setCart(prev => {
              const updated = prev.map(item => item.id === id ? { ...item, quantity: qty } : item);
              localStorage.setItem('cart', JSON.stringify(updated));
              return updated;
            });
          }}
          onRemoveItem={(id) => {
            setCart(prev => {
              const updated = prev.filter(item => item.id !== id);
              localStorage.setItem('cart', JSON.stringify(updated));
              return updated;
            });
            setToast({ visible: true, message: 'Producto eliminado', type: 'success' });
          }}
          onCheckout={() => {
            if (!user) {
              setToast({ visible: true, message: 'Inicia sesión para comprar', type: 'error' });
              setCurrentView('login');
              return;
            }
            setCurrentView('checkout');
          }}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    if (currentView === 'checkout') {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal > 2000 ? 0 : 250;
      return (
        <Checkout
          cartItems={cart}
          total={subtotal + shipping}
          onSuccess={() => {
            setCart([]);
            localStorage.removeItem('cart');
            setToast({ visible: true, message: '¡Pedido realizado con éxito!', type: 'success' });
            setCurrentView('home');
          }}
          onBack={() => setCurrentView('cart')}
        />
      );
    }

    if (currentView === 'orders') {
      return (
        <OrderHistory
          onBack={() => setCurrentView('home')}
        />
      );
    }

    return (
      <>
        <div className="flex flex-col gap-0 -mx-4 sm:mx-0 bg-transparent">
          {/* Header */}
          <div className="sticky top-0 z-30 glass shadow-sm px-4 pt-3 pb-3">
            <div className="flex items-center justify-between bg-transparent">
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 duration-200"
                onClick={() => setCurrentView('home')}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold animate-float">G</div>
                <h1 className="text-lg font-black italic tracking-tighter">
                  <span className="text-app-text">La Ganga</span>
                  <div className="text-[10px] text-blue-600 mt-2 font-bold tracking-[0.3em] uppercase">Phone RD</div>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-all hover:scale-110 active:scale-95"
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <button className="relative p-1 transition-transform active:scale-90" onClick={() => setCurrentView('cart')}>
                  <ShoppingCart className="text-app-text w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black animate-pulse">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button
                  className="p-1 transition-transform active:scale-90"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-app-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3 bg-app-bg border-b border-app-border">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted transition-colors group-focus-within:text-blue-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="w-full bg-app-card border border-app-border rounded-2xl py-3 pl-12 pr-10 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-app-text placeholder-app-muted transition-all shadow-sm"
                placeholder="Buscar productos y marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 bg-white">
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
      <div className="min-h-screen bg-app-bg text-app-text font-sans transition-colors duration-400">
        <main className={`max-w-7xl mx-auto min-h-screen ${currentView === 'home' ? 'px-0 pt-0' : 'px-4 sm:px-6 lg:px-8 pt-8'}`}>
          {renderContent()}
        </main>



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
          onLogout={handleLogout}
          isAdmin={isAdmin}
          user={user}
        />
      </div>
    </>
  );
};

export default App;