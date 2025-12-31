
import React, { useState } from 'react';
import { Product } from '../types';
import {
   LayoutDashboard,
   Package,
   Settings,
   LogOut,
   User,
   ShoppingBag
} from 'lucide-react';

interface UserProfileProps {
   allItems: Product[];
   onBack: () => void;
}

type Tab = 'dashboard' | 'orders' | 'settings';

export const UserProfile: React.FC<UserProfileProps> = ({ allItems, onBack }) => {
   const [activeTab, setActiveTab] = useState<Tab>('dashboard');

   const renderSidebarItem = (id: Tab, label: string, icon: React.ReactNode) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group
        ${activeTab === id
               ? 'bg-black text-white'
               : 'text-gray-500 hover:bg-gray-100'
            }`}
      >
         {React.cloneElement(icon as React.ReactElement, {
            className: `w-5 h-5`
         })}
         <span className="text-sm font-bold">{label}</span>
      </button>
   );

   const renderDashboard = () => (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">0</h3>
               <p className="text-sm text-gray-500">Pedidos Totales</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4">
                  <Package className="w-6 h-6 text-orange-600" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">0</h3>
               <p className="text-sm text-gray-500">En Camino</p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-900">Sin pedidos recientes</h3>
            <p className="text-sm text-gray-500 mt-1">Explora el catálogo para realizar tu primera compra.</p>
            <button onClick={onBack} className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800">
               Explorar Productos
            </button>
         </div>
      </div>
   );

   const renderSettings = () => (
      <div className="space-y-6">
         <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
               <User className="w-5 h-5" />
               Información Personal
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                  <input type="text" value="Usuario Demo" disabled className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                  <input type="email" value="cliente@ejemplo.com" disabled className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium" />
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] py-6">
         {/* Sidebar */}
         <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-4 px-4 py-4 mb-2">
               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-gray-400" />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">Usuario</h3>
                  <p className="text-xs text-gray-500">Cliente</p>
               </div>
            </div>

            <nav className="flex-1 space-y-1">
               {renderSidebarItem('dashboard', 'Resumen', <LayoutDashboard />)}
               {renderSidebarItem('orders', 'Mis Pedidos', <ShoppingBag />)}
               {renderSidebarItem('settings', 'Configuración', <Settings />)}
            </nav>

            <button
               onClick={onBack}
               className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-auto"
            >
               <LogOut className="w-5 h-5" />
               <span className="text-sm font-bold">Salir</span>
            </button>
         </aside>

         {/* Content */}
         <main className="flex-1 bg-gray-50 rounded-3xl p-6 lg:p-8">
            <header className="mb-8">
               <h2 className="text-2xl font-black text-gray-900">
                  {activeTab === 'dashboard' ? 'Mi Resumen' :
                     activeTab === 'orders' ? 'Mis Pedidos' : 'Configuración'}
               </h2>
            </header>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderDashboard()}
            {activeTab === 'settings' && renderSettings()}
         </main>
      </div>
   );
};
