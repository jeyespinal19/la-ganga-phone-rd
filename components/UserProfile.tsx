
import React, { useState } from 'react';
import { Product } from '../types';
import {
   LayoutDashboard,
   Package,
   Settings,
   LogOut,
   User,
   ShoppingBag,
   MapPin,
   CreditCard,
   Bell,
   CheckCircle2,
   ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';

interface UserProfileProps {
   allItems: Product[];
   onBack: () => void;
}

type Tab = 'dashboard' | 'orders' | 'settings';

export const UserProfile: React.FC<UserProfileProps> = ({ allItems, onBack }) => {
   const { user, signOut } = useAuth();
   const [activeTab, setActiveTab] = useState<Tab>('dashboard');
   const [savedAddresses] = useState([
      { id: '1', alias: 'Hogar', address: 'Av. Winston Churchill #123, Santo Domingo', isDefault: true }
   ]);

   const renderSidebarLink = (id: Tab, label: string, icon: React.ReactNode) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
        ${activeTab === id
               ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
               : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
      >
         {React.cloneElement(icon as React.ReactElement, {
            className: `w-5 h-5 ${activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`
         })}
         <span className="text-sm font-bold">{label}</span>
      </button>
   );

   const renderDashboard = () => (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
               <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl w-fit mb-4">
                  <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">0</h3>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Pedidos Totales</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl w-fit mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
               </div>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">0</h3>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Entregados</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full blur-2xl" />
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">¡No hay pedidos aún!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">Tu historial de compras aparecerá aquí cuando realices tu primer pedido.</p>
            <button onClick={onBack} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95">
               ¡IR A COMPRAR AHORA!
            </button>
         </div>
      </div>
   );

   const renderSettings = () => (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
               <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
               </div>
               Información Personal
            </h3>
            <div className="grid grid-cols-1 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input type="text" value={user?.user_metadata?.name || 'Cargando...'} disabled className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-700 dark:text-gray-300 font-bold" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Registrado</label>
                  <input type="email" value={user?.email || 'Cargando...'} disabled className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-700 dark:text-gray-300 font-bold" />
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                     <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  Direcciones de Envío
               </h3>
               <button className="text-blue-600 font-black text-xs hover:underline uppercase tracking-wider">Añadir Nueva</button>
            </div>

            <div className="space-y-3">
               {savedAddresses.map(addr => (
                  <div key={addr.id} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer">
                     <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-500">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-900 dark:text-white">{addr.alias}</span>
                           {addr.isDefault && <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">Principal</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{addr.address}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="pt-4">
            <button
               onClick={() => signOut()}
               className="w-full py-5 rounded-2xl border-2 border-red-50 dark:border-red-900/30 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-3"
            >
               <LogOut className="w-5 h-5" />
               CERRAR SESIÓN
            </button>
         </div>
      </div>
   );

   return (
      <div className="flex flex-col lg:flex-row gap-10 min-h-[600px] py-10 px-4 max-w-6xl mx-auto">
         {/* Sidebar */}
         <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
            <div className="glass p-6 rounded-[2rem] flex items-center gap-4 bg-white/40 border-white/50 dark:bg-gray-800/40 dark:border-gray-700/50 backdrop-blur-xl shadow-xl shadow-blue-900/5">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                  <span className="text-2xl font-black text-white">{user?.user_metadata?.name?.charAt(0) || 'U'}</span>
               </div>
               <div className="flex-1 overflow-hidden">
                  <h3 className="font-black text-gray-900 dark:text-white truncate tracking-tight">{user?.user_metadata?.name || 'Usuario'}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Nivel Platino</p>
               </div>
            </div>

            <nav className="space-y-2">
               {renderSidebarLink('dashboard', 'Mi Resumen', <LayoutDashboard />)}
               {renderSidebarLink('orders', 'Mis Pedidos', <ShoppingBag />)}
               {renderSidebarLink('settings', 'Perfil y Seguridad', <Settings />)}
            </nav>

            <div className="mt-10 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="font-black text-lg mb-1">Ganga VIP</h4>
                  <p className="text-xs text-indigo-100 font-bold mb-4 opacity-80 leading-relaxed">Disfruta de envíos gratis ilimitados y prioridad en ofertas.</p>
                  <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg">MEJORAR AHORA</button>
               </div>
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </div>
         </aside>

         {/* Content */}
         <main className="flex-1">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                     {activeTab === 'dashboard' ? 'Hola de nuevo,' :
                        activeTab === 'orders' ? 'Tu Actividad' : 'Configuración'}
                  </h2>
                  <p className="text-gray-400 font-bold mt-1">
                     {activeTab === 'dashboard' ? `¡Qué bueno verte por aquí!` :
                        activeTab === 'orders' ? 'Consulta el estado de tus compras' : 'Gestiona tus datos personales'}
                  </p>
               </div>
               <button onClick={onBack} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-95">
                  <ArrowLeft className="w-6 h-6" />
               </button>
            </div>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderDashboard()}
            {activeTab === 'settings' && renderSettings()}
         </main>
      </div>
   );
};
