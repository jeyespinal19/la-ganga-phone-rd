
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${activeTab === id 
          ? 'bg-app-accent text-white shadow-lg shadow-app-accent/25' 
          : 'text-app-muted hover:bg-app-bg hover:text-app-text'
        }`}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
        className: `w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : ''}`
      })}
      <span className="font-medium text-sm">{label}</span>
      {id === 'winning' && winningItems.length > 0 && (
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20 text-white' : 'bg-app-accent/10 text-app-accent'}`}>
          {winningItems.length}
        </span>
      )}
    </button>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-app-card border border-app-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">+2.5%</span>
          </div>
          <p className="text-app-muted text-sm mb-1">Compromiso Total</p>
          <h3 className="text-2xl font-bold text-app-text">DOP {totalSpent.toLocaleString()}</h3>
        </div>

        <div className="bg-app-card border border-app-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-purple-500/10 rounded-lg">
              <Gavel className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-app-muted text-sm mb-1">Pujas Realizadas</p>
          <h3 className="text-2xl font-bold text-app-text">{totalBidsCount}</h3>
        </div>

        <div className="bg-app-card border border-app-border p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-app-muted text-sm mb-1">Subastas Ganando</p>
          <h3 className="text-2xl font-bold text-app-text">{winningItems.length}</h3>
        </div>
      </div>

      {/* Recent Activity Mini List */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-app-text mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {sortedBids.slice(0, 4).map((bid, idx) => (
             <div key={idx} className="flex items-center justify-between p-3 bg-app-bg rounded-xl border border-app-border">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-app-card flex items-center justify-center border border-app-border">
                      <Clock className="w-5 h-5 text-app-muted" />
                   </div>
                   <div>
                      <p className="text-sm font-semibold text-app-text">{bid.itemName}</p>
                      <p className="text-xs text-app-muted">Puja realizada</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="block font-bold text-app-text">DOP {bid.amount.toLocaleString()}</span>
                   <span className="text-xs text-app-muted">{new Date(bid.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
             </div>
          ))}
          {sortedBids.length === 0 && (
             <p className="text-app-muted text-sm text-center py-4">No hay actividad reciente.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-gray-700">
           <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
           <div className="relative z-10 flex justify-between items-start mb-12">
              <CreditCard className="w-10 h-10 opacity-80" />
              <span className="text-lg font-mono opacity-60">DEBIT</span>
           </div>
           <div className="relative z-10">
              <p className="text-gray-400 text-sm mb-2">Saldo Disponible</p>
              <h3 className="text-4xl font-bold mb-8">DOP 14,250.00</h3>
              <div className="flex justify-between items-end">
                 <p className="font-mono tracking-widest text-lg">**** **** **** 4289</p>
                 <p className="text-sm opacity-80">EXP 12/28</p>
              </div>
           </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-app-text mb-4">Historial de Transacciones</h3>
            <div className="space-y-4 text-center py-8 text-app-muted border-dashed border-2 border-app-border rounded-xl">
               <Wallet className="w-12 h-12 mx-auto mb-2 opacity-20" />
               <p>No hay transacciones recientes para mostrar.</p>
            </div>
        </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-app-card border border-app-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-app-text mb-6 flex items-center gap-2">
             <User className="w-5 h-5" />
             Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-app-muted uppercase">Nombre de Usuario</label>
                <input type="text" value="Admin" disabled className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-app-muted uppercase">Email</label>
                <input type="email" value="admin@lagransubasta.com" disabled className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text" />
             </div>
          </div>
       </div>

       <div className="bg-app-card border border-app-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-app-text mb-6 flex items-center gap-2">
             <Bell className="w-5 h-5" />
             Notificaciones
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 rounded-lg hover:bg-app-bg transition-colors cursor-pointer">
                <div>
                   <p className="font-medium text-app-text">Alertas de Subasta</p>
                   <p className="text-xs text-app-muted">Recibir notificación cuando superen mi puja</p>
                </div>
                <div className="w-10 h-5 bg-app-accent rounded-full relative">
                   <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                </div>
             </div>
             <div className="flex items-center justify-between p-3 rounded-lg hover:bg-app-bg transition-colors cursor-pointer">
                <div>
                   <p className="font-medium text-app-text">Boletín Semanal</p>
                   <p className="text-xs text-app-muted">Nuevos productos y ofertas especiales</p>
                </div>
                <div className="w-10 h-5 bg-app-border rounded-full relative">
                   <div className="w-3 h-3 bg-app-muted/50 rounded-full absolute top-1 left-1"></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] h-[calc(100vh-100px)] overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-app-card border border-app-border rounded-2xl p-4 flex flex-col shrink-0 overflow-y-auto">
        
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-app-border/50">
          <div className="relative">
             <img src="https://picsum.photos/seed/useravatar/60/60" alt="Avatar" className="w-12 h-12 rounded-full border border-app-border" />
             <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-app-card rounded-full"></span>
          </div>
          <div className="overflow-hidden">
             <h3 className="font-bold text-app-text truncate">Admin User</h3>
             <p className="text-xs text-app-muted truncate">admin@demo.com</p>
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
                  )})}
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
