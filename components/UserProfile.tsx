
import React, { useState, useMemo } from 'react';
import { UserBid, AuctionItem } from '../types';
import {
   LayoutDashboard,
   Gavel,
   Trophy,
   Settings,
   CreditCard,
   LogOut,
   Bell,
   User,
   ArrowUpRight,
   Wallet,
   Clock
} from 'lucide-react';

interface UserProfileProps {
   userBids: UserBid[];
   allItems: AuctionItem[];
   onBack: () => void;
}

type Tab = 'dashboard' | 'bids' | 'winning' | 'wallet' | 'settings';

export const UserProfile: React.FC<UserProfileProps> = ({ userBids, allItems, onBack }) => {
   const [activeTab, setActiveTab] = useState<Tab>('dashboard');

   // --- Logic & Derived State ---

   const winningItems = useMemo(() => {
      const winningIds = new Set<string>();
      const maxUserBids: Record<string, number> = {};

      userBids.forEach(bid => {
         if (!maxUserBids[bid.itemId] || bid.amount > maxUserBids[bid.itemId]) {
            maxUserBids[bid.itemId] = bid.amount;
         }
      });

      allItems.forEach(item => {
         if (maxUserBids[item.id] && maxUserBids[item.id] === item.currentBid) {
            winningIds.add(item.id);
         }
      });

      return allItems.filter(item => winningIds.has(item.id));
   }, [userBids, allItems]);

   const sortedBids = [...userBids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

   const totalSpent = winningItems.reduce((acc, item) => acc + item.currentBid, 0);
   const totalBidsCount = userBids.length;

   // --- Render Helpers ---

   const renderSidebarItem = (id: Tab, label: string, icon: React.ReactNode) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
        ${activeTab === id
               ? 'text-black font-black'
               : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
      >
         {activeTab === id && (
            <div className="absolute inset-0 bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta animate-in fade-in duration-500" />
         )}
         <div className="relative flex items-center gap-4 w-full">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
               className: `w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-black' : 'text-white/20 group-hover:text-app-neon-cyan'}`
            })}
            <span className="text-xs uppercase tracking-[0.2em] font-black">{label}</span>
            {id === 'winning' && winningItems.length > 0 && (
               <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg ${activeTab === id ? 'bg-black/20 text-black' : 'bg-app-neon-magenta/20 text-app-neon-magenta'}`}>
                  {winningItems.length}
               </span>
            )}
         </div>
      </button>
   );

   const renderDashboard = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-app-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-app-neon-cyan/20 rounded-2xl border border-app-neon-cyan/30">
                     <Wallet className="w-6 h-6 text-app-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
                  </div>
                  <span className="text-[10px] text-app-neon-cyan font-black bg-app-neon-cyan/10 px-3 py-1 rounded-full border border-app-neon-cyan/20 uppercase tracking-widest">Activo</span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Inversión Total</p>
               <h3 className="text-3xl font-black text-white tracking-tighter">DOP {totalSpent.toLocaleString()}</h3>
            </div>

            <div className="glass border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-app-neon-magenta/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-app-neon-magenta/20 rounded-2xl border border-app-neon-magenta/30">
                     <Gavel className="w-6 h-6 text-app-neon-magenta shadow-[0_0_15px_rgba(255,0,255,0.5)]" />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Pujas en Curso</p>
               <h3 className="text-3xl font-black text-white tracking-tighter">{totalBidsCount}</h3>
            </div>

            <div className="glass border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-app-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                     <Trophy className="w-6 h-6 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Victorias</p>
               <h3 className="text-3xl font-black text-white tracking-tighter">{winningItems.length}</h3>
            </div>
         </div>

         {/* Recent Activity Mini List */}
         <div className="glass border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <div className="w-2 h-2 bg-app-neon-cyan rounded-full animate-pulse" />
               Rastreo de Actividad
            </h3>
            <div className="space-y-4">
               {sortedBids.slice(0, 4).map((bid, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-app-neon-cyan/30 transition-all group/item">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 group-hover/item:border-app-neon-cyan/50 transition-colors">
                           <Clock className="w-6 h-6 text-white/20 group-hover/item:text-app-neon-cyan" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-white tracking-tight">{bid.itemName}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Oferta Realizada</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block font-black text-app-neon-cyan text-lg">DOP {bid.amount.toLocaleString()}</span>
                        <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                  </div>
               ))}
               {sortedBids.length === 0 && (
                  <div className="py-12 text-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Zona Silenciosa</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );

   const renderWallet = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black border border-white/10 p-10 rounded-[2.5rem] text-white shadow-2xl overflow-hidden transition-transform duration-500 group-hover:rotate-x-2">
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
               <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-app-neon-cyan opacity-5 rounded-full blur-2xl"></div>

               <div className="relative z-10 flex justify-between items-start mb-16">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                     <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-xs font-black tracking-[0.5em] text-white/40 uppercase">Platinum Node</span>
               </div>

               <div className="relative z-10">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-3 leading-none">Capital Disponible</p>
                  <h3 className="text-5xl font-black mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">DOP 14,250.00</h3>

                  <div className="flex justify-between items-end border-t border-white/10 pt-8">
                     <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Identidad Digital</p>
                        <p className="font-black tracking-widest text-lg text-white/60">**** **** **** 4289</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Expira</p>
                        <p className="font-black text-sm text-white/60">12 / 28</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="glass border border-white/10 rounded-[2.5rem] p-10">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8">Libro de Transacciones</h3>
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
               <Wallet className="w-16 h-16 mx-auto mb-6 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 leading-loose">Registro de datos vacío.<br />No se detectan movimientos.</p>
            </div>
         </div>
      </div>
   );

   const renderSettings = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="glass border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
               <div className="p-2 bg-app-neon-cyan/20 rounded-lg text-app-neon-cyan">
                  <User className="w-5 h-5" />
               </div>
               Información de Perfil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Alias del Nodo</label>
                  <div className="relative group">
                     <div className="absolute inset-0 bg-app-neon-cyan/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     <input type="text" value="Admin" disabled className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black tracking-tight focus:border-app-neon-cyan transition-all cursor-not-allowed opacity-60" />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Enlace de Comunicación</label>
                  <div className="relative group">
                     <div className="absolute inset-0 bg-app-neon-cyan/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     <input type="email" value="admin@lagransubasta.com" disabled className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black tracking-tight focus:border-app-neon-cyan transition-all cursor-not-allowed opacity-60" />
                  </div>
               </div>
            </div>
         </div>

         <div className="glass border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
               <div className="p-2 bg-app-neon-magenta/20 rounded-lg text-app-neon-magenta">
                  <Bell className="w-5 h-5" />
               </div>
               Frecuencias de Notificación
            </h3>
            <div className="space-y-2">
               <div className="flex items-center justify-between p-6 rounded-[1.5rem] hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 bg-app-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                     <div>
                        <p className="font-black text-white uppercase tracking-widest text-xs">Alertas de Puja</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-1 tracking-wider">Notificar si mi oferta es superada</p>
                     </div>
                  </div>
                  <div className="w-12 h-6 bg-app-neon-cyan rounded-full relative shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                     <div className="w-4 h-4 bg-black rounded-full absolute top-1 right-1"></div>
                  </div>
               </div>

               <div className="flex items-center justify-between p-6 rounded-[1.5rem] hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 bg-white/10 rounded-full" />
                     <div>
                        <p className="font-black text-white/40 uppercase tracking-widest text-xs">Novedades del Sector</p>
                        <p className="text-[10px] text-white/20 font-bold uppercase mt-1 tracking-wider">Reportes semanales de equipos</p>
                     </div>
                  </div>
                  <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full relative">
                     <div className="w-4 h-4 bg-white/20 rounded-full absolute top-1 left-1"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] h-[calc(100vh-100px)] overflow-hidden">

         {/* Sidebar Navigation */}
         <aside className="w-full lg:w-80 glass border border-white/10 rounded-[2.5rem] p-6 flex flex-col shrink-0 overflow-y-auto">

            {/* User Mini Profile */}
            <div className="flex items-center gap-4 px-2 py-6 mb-8 border-b border-white/5">
               <div className="relative group">
                  <div className="absolute inset-0 bg-app-neon-cyan rounded-full blur-md opacity-20 animate-pulse" />
                  <img src="https://picsum.photos/seed/useravatar/60/60" alt="Avatar" className="relative w-14 h-14 rounded-full border-2 border-white/20 object-cover group-hover:border-app-neon-cyan transition-colors" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-app-neon-cyan border-4 border-black rounded-full shadow-[0_0_10px_rgba(0,229,255,1)]"></span>
               </div>
               <div className="overflow-hidden">
                  <h3 className="font-black text-white tracking-tight truncate leading-tight">Admin User</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Rango: Nexus Prime</p>
               </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
               {renderSidebarItem('dashboard', 'Panel Principal', <LayoutDashboard />)}
               {renderSidebarItem('bids', 'Mis Pujas', <Gavel />)}
               {renderSidebarItem('winning', 'Ganando', <Trophy />)}
               {renderSidebarItem('wallet', 'Billetera', <CreditCard />)}
               {renderSidebarItem('settings', 'Configuración', <Settings />)}
            </nav>

            {/* Logout / Back */}
            <div className="mt-6 pt-4 border-t border-app-border/50 space-y-2">
               <button
                  onClick={onBack}
                  className="w-full flex items-center gap-3 px-4 py-3 text-app-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
               >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Cerrar Sesión</span>
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 bg-app-bg rounded-2xl overflow-y-auto pr-2 custom-scrollbar">
            {/* Mobile Title (Only visible on small screens inside content area context if needed, but sidebar is atop) */}
            <header className="mb-6 flex justify-between items-center">
               <h2 className="text-2xl font-bold text-app-text capitalize">
                  {activeTab === 'bids' ? 'Historial de Pujas' :
                     activeTab === 'winning' ? 'Subastas Ganando' :
                        activeTab === 'wallet' ? 'Mi Billetera' :
                           activeTab === 'settings' ? 'Ajustes' : 'Panel de Control'}
               </h2>
               <button onClick={onBack} className="text-sm text-app-accent hover:underline flex items-center gap-1 lg:hidden">
                  Volver <ArrowUpRight className="w-3 h-3" />
               </button>
            </header>

            {activeTab === 'dashboard' && renderDashboard()}

            {activeTab === 'wallet' && renderWallet()}

            {activeTab === 'settings' && renderSettings()}

            {activeTab === 'bids' && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-app-bg border-b border-app-border">
                           <tr>
                              <th className="p-4 font-semibold text-app-muted">Producto</th>
                              <th className="p-4 font-semibold text-app-muted hidden sm:table-cell">Fecha</th>
                              <th className="p-4 font-semibold text-app-muted text-right">Monto</th>
                              <th className="p-4 font-semibold text-app-muted text-right">Estado</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                           {sortedBids.map((bid, i) => (
                              <tr key={i} className="hover:bg-app-bg transition-colors">
                                 <td className="p-4 font-medium text-app-text">{bid.itemName}</td>
                                 <td className="p-4 text-app-muted hidden sm:table-cell">{new Date(bid.timestamp).toLocaleDateString()}</td>
                                 <td className="p-4 text-app-text font-mono text-right">DOP {bid.amount.toLocaleString()}</td>
                                 <td className="p-4 text-right">
                                    <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-500">
                                       Ofertado
                                    </span>
                                 </td>
                              </tr>
                           ))}
                           {sortedBids.length === 0 && (
                              <tr>
                                 <td colSpan={4} className="p-8 text-center text-app-muted">No hay pujas registradas</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'winning' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {winningItems.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {winningItems.map(item => {
                           const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                           const imgSrc = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/100/100`;

                           return (
                              <div key={item.id} className="bg-app-card border border-app-border rounded-2xl p-4 flex gap-4 hover:border-app-accent/50 transition-colors">
                                 <div className="w-20 h-20 bg-app-image-bg rounded-lg flex items-center justify-center p-2 shrink-0">
                                    <img src={imgSrc} alt={item.name} className="max-w-full max-h-full object-contain" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-app-text truncate">{item.name}</h4>
                                    <p className="text-sm text-app-muted mb-2">{item.timeLeft}</p>
                                    <div className="flex items-center justify-between">
                                       <span className="text-lg font-bold text-app-accent">DOP {item.currentBid.toLocaleString()}</span>
                                       <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">GANANDO</span>
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  ) : (
                     <div className="bg-app-card border border-app-border rounded-2xl p-12 text-center">
                        <Trophy className="w-16 h-16 text-app-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-app-text">Sin Victorias Activas</h3>
                        <p className="text-app-muted">¡Empieza a pujar para llenar esta lista!</p>
                     </div>
                  )}
               </div>
            )}
         </main>
      </div>
   );
};
