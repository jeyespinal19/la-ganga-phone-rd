import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Moon, Sun, ChevronDown, User, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'profile' | 'admin' | 'product-detail';
  onNavigate: (view: 'home' | 'profile' | 'admin') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDarkMode,
  toggleTheme
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (view: 'home' | 'profile' | 'admin') => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="glass w-full sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
      <div className="h-20 px-4 sm:px-8 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-app-neon-cyan blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-gradient-to-br from-app-neon-cyan to-app-neon-magenta p-2 rounded-xl shrink-0 shadow-lg">
              <Smartphone className="w-6 h-6 text-black" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white whitespace-nowrap font-sans">
            La Ganga Phone
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta"> RD</span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50 hover:text-app-neon-cyan cursor-pointer transition-all p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden md:inline">{isDarkMode ? 'Claro' : 'Oscuro'}</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-2xl transition-all border ${isMenuOpen ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-transparent hover:border-white/10'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-app-neon-cyan rounded-full blur-sm opacity-20" />
                <img
                  src="https://picsum.photos/seed/useravatar/40/40"
                  alt="User"
                  className="relative w-full h-full rounded-full border-2 border-white/20 object-cover"
                />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Cuenta</span>
                  <span className="font-extrabold text-white">Admin</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-app-neon-cyan' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-4 w-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-5 py-4 border-b border-white/10 mb-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-app-neon-cyan mb-1">Administrador</p>
                  <p className="text-sm font-bold text-white truncate">admin@lagransubasta.com</p>
                </div>

                <div className="px-2 space-y-1">
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <User className="w-5 h-5 text-white/30 group-hover:text-app-neon-cyan" />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => handleNavigate('admin')}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <LayoutDashboard className="w-5 h-5 text-white/30 group-hover:text-app-neon-cyan" />
                    Panel Control
                  </button>
                </div>

                <div className="border-t border-white/10 my-2"></div>

                <div className="px-2">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full text-left px-4 py-3 text-sm font-black text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors group uppercase tracking-widest"
                  >
                    <LogOut className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};