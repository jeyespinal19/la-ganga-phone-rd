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
    <nav className="glass w-full bg-app-bg border-b border-app-border sticky top-0 z-50 transition-colors duration-300">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-blue-600 p-1 rounded-md shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide text-app-text whitespace-nowrap">
            La Ganga Phone RD
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm text-app-muted hover:text-app-text cursor-pointer transition-colors p-2 rounded-full hover:bg-app-card/50"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden md:inline">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              className={`flex items-center gap-2 sm:gap-3 cursor-pointer p-1.5 rounded-lg transition-colors ${isMenuOpen ? 'bg-app-card' : 'hover:bg-app-card/50'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src="https://picsum.photos/seed/useravatar/40/40"
                alt="User"
                className="w-8 h-8 rounded-full border border-app-border object-cover"
              />
              <div className="hidden sm:flex items-center gap-1 text-sm text-app-muted">
                <span className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[10px] uppercase">Hola,</span>
                  <span className="font-semibold text-app-text">Admin</span>
                </span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-app-card border border-app-border rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 py-3 border-b border-app-border mb-2">
                  <p className="text-sm font-bold text-app-text">Administrador</p>
                  <p className="text-xs text-app-muted">admin@lagransubasta.com</p>
                </div>

                <button
                  onClick={() => handleNavigate('profile')}
                  className="w-full text-left px-4 py-2 text-sm text-app-muted hover:text-app-text hover:bg-app-bg flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>

                <button
                  onClick={() => handleNavigate('admin')}
                  className="w-full text-left px-4 py-2 text-sm text-app-muted hover:text-app-text hover:bg-app-bg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel de Administración
                </button>

                <div className="border-t border-app-border my-2"></div>

                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};