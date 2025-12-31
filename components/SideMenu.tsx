import React from 'react';
import { X, User, ShoppingCart, LayoutDashboard, Settings } from 'lucide-react';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: any) => void;
    onLogout: () => void;
    isAdmin: boolean;
    user: any;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, onLogout, isAdmin, user }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <h2 className="font-bold text-lg">Menú</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* User Info (Optional but nice) */}
                    {user && (
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="font-medium truncate">{user.email}</div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => { onNavigate('profile'); onClose(); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span>Perfil</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { onNavigate('cart'); onClose(); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Carrito</span>
                                </button>
                            </li>

                            <li>
                                <button
                                    onClick={() => { onNavigate('settings'); onClose(); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    <Settings className="w-5 h-5" />
                                    <span>Configuración</span>
                                </button>
                            </li>

                            {isAdmin && (
                                <li>
                                    <button
                                        onClick={() => { onNavigate('admin'); onClose(); }}
                                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-blue-600 font-medium transition-colors bg-blue-50/50"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span>Panel de Admin</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Footer Items */}
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        <button
                            onClick={() => { onLogout(); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
