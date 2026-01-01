
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
   ArrowLeft,
   Trash2
} from 'lucide-react';
import { OrderHistory } from './OrderHistory';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { productService } from '../services/productService';

interface UserProfileProps {
   allItems: Product[];
   onBack: () => void;
}

type Tab = 'dashboard' | 'orders' | 'settings';

export const UserProfile: React.FC<UserProfileProps> = ({ allItems, onBack }) => {
   const { user, signOut } = useAuth();
   const [activeTab, setActiveTab] = useState<Tab>('dashboard');
   const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [showAddAddress, setShowAddAddress] = useState(false);
   const [newAddress, setNewAddress] = useState({ alias: '', address: '', city: '' });

   React.useEffect(() => {
      if (user) {
         fetchUserData();
      }
   }, [user]);

   const fetchUserData = async () => {
      setLoading(true);
      try {
         const [addrData, orderData] = await Promise.all([
            productService.getAddresses(user!.id),
            productService.getOrders(user!.id)
         ]);
         setSavedAddresses(addrData);
         setOrders(orderData);
      } catch (err) {
         console.error('Error fetching user data:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleAddAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         await productService.addAddress({
            ...newAddress,
            user_id: user!.id,
            is_default: savedAddresses.length === 0
         });
         setShowAddAddress(false);
         setNewAddress({ alias: '', address: '', city: '' });
         fetchUserData();
      } catch (err) {
         console.error('Error adding address:', err);
      }
   };

   const handleDeleteAddress = async (id: string) => {
      try {
         await productService.deleteAddress(id);
         fetchUserData();
      } catch (err) {
         console.error('Error deleting address:', err);
      }
   };

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
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">{orders.length}</h3>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Pedidos Totales</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
               <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl w-fit mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
               </div>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'delivered').length}
               </h3>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Entregados</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full blur-2xl" />
            </div>
         </div>

         {orders.length === 0 ? (
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
         ) : (
            <div className="space-y-4">
               {orders.slice(0, 3).map(order => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                     <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-blue-600">{formatCurrency(order.total)}</p>
                        <span className="text-[10px] font-black uppercase text-orange-500">{order.status}</span>
                     </div>
                  </div>
               ))}
               <button onClick={() => setActiveTab('orders')} className="w-full py-3 text-sm font-black text-blue-600 hover:underline">VER TODOS LOS PEDIDOS</button>
            </div>
         )}
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
               <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-blue-600 font-black text-xs hover:underline uppercase tracking-wider"
               >
                  Añadir Nueva
               </button>
            </div>

            {showAddAddress && (
               <form onSubmit={handleAddAddress} className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
                  <input
                     placeholder="Nombre de lugar (Ej: Mi Casa, Oficina)"
                     className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                     value={newAddress.alias}
                     onChange={e => setNewAddress({ ...newAddress, alias: e.target.value })}
                     required
                  />
                  <div className="grid grid-cols-2 gap-3">
                     <input
                        placeholder="Ciudad"
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                        value={newAddress.city}
                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                     />
                     <input
                        placeholder="Dirección Completa"
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                        value={newAddress.address}
                        onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                        required
                     />
                  </div>
                  <div className="flex gap-2">
                     <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl text-xs">GUARDAR DIRECCIÓN</button>
                     <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-black py-3 rounded-xl text-xs">CANCELAR</button>
                  </div>
               </form>
            )}

            <div className="space-y-3">
               {savedAddresses.map(addr => (
                  <div key={addr.id} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                     <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-500">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-900 dark:text-white">{addr.alias}</span>
                           {addr.is_default && <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">Principal</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{addr.address}, {addr.city}</p>
                     </div>
                     <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               ))}
               {savedAddresses.length === 0 && (
                  <p className="text-center py-6 text-sm text-gray-400 font-bold italic">No has guardado ninguna dirección aún.</p>
               )}
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
            {activeTab === 'orders' && <OrderHistory onBack={() => setActiveTab('dashboard')} />}
            {activeTab === 'settings' && renderSettings()}
         </main>
      </div>
   );
};
