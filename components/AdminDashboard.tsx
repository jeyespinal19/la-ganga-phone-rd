
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Plus,
  Trash2,
  Search,
  DollarSign,
  Edit,
  X,
  Upload,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck as TruckIcon,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { Product, User, Order } from '../types';
import { formatCurrency } from '../utils/format';
import { productService } from '../services/productService';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  items: Product[];
  users: User[];
  onAddItem: (newItem: Omit<Product, 'id'>) => void;
  onEditItem: (id: string, updatedFields: Partial<Product>) => void;
  onDeleteItem: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onLogout: () => void;
  onBack: () => void;
}

type Tab = 'overview' | 'products' | 'users' | 'orders';

const ROW_HEIGHT = 80;

interface SidebarButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 relative group ${active
      ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1'
      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 hover:translate-x-1'
      }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="tracking-tight lg:block">{label}</span>
    {active && (
      <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse hidden lg:block" />
    )}
  </button>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  users,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDeleteUser,
  onLogout,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();

      // Subscribe to real-time order updates
      const channel = supabase
        .channel('admin_orders_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await productService.getAllOrders();
      console.log('Orders data:', data);

      // Map order_items to items for UI consistency
      const mappedOrders = data.map((order: any) => ({
        ...order,
        items: order.order_items || []
      }));
      setOrders(mappedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrdersError(err.message || 'Error al cargar los pedidos');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await productService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    brand: 'Samsung',
    specs: '',
    price: '',
    originalPrice: '',
    stock: '0',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setNewItem({ name: '', brand: 'Samsung', specs: '', price: '', originalPrice: '' });
    setImagePreview(null);
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: Product) => {
    setNewItem({
      name: item.name,
      brand: item.brand,
      specs: item.specs,
      price: item.price.toString(),
      stock: item.stock ? item.stock.toString() : '0',
      originalPrice: item.originalPrice ? item.originalPrice.toString() : ''
    });
    setImagePreview(item.imageDetails);
    setEditingId(item.id);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name || !newItem.price) return;

    const itemData = {
      name: newItem.name,
      brand: newItem.brand,
      specs: newItem.specs,
      price: Number(newItem.price),
      stock: Number(newItem.stock || 0),
      originalPrice: newItem.originalPrice ? Number(newItem.originalPrice) : undefined,
      imageDetails: imagePreview || '1' // Fallback
    };

    if (editingId) {
      onEditItem(editingId, itemData);
    } else {
      onAddItem(itemData);
    }

    setShowAddModal(false);
  };

  const renderProducts = () => {
    const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-blue-500/5">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Inventario</h2>
            <p className="text-sm font-bold text-blue-600/60 uppercase tracking-widest">{items.length} productos disponibles</p>
          </div>
          <button
            onClick={openAddModal}
            className="group bg-blue-600 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Nuevo Producto
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-lg shadow-blue-500/5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/60 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-blue-300"
            />
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-white/40 bg-white/20">
                  <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] w-24 text-center">Visual</th>
                  <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em]">Producto / Detalles</th>
                  <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] text-center">Stock</th>
                  <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] text-right">Precio</th>
                  <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredItems.map((item) => {
                  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                  const imgSrc = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/200/200`;

                  return (
                    <tr key={item.id} className="group hover:bg-white/50 transition-all duration-300">
                      <td className="p-6 text-center">
                        <div className="relative w-14 h-14 mx-auto group-hover:scale-110 transition-transform duration-500">
                          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                          <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-white shadow-inner">
                            <img src={imgSrc} className="w-full h-full object-cover" alt="product" />
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="font-black text-gray-900 text-base group-hover:text-blue-600 transition-colors">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{item.brand}</span>
                          <span className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{item.specs}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-sm ${item.stock > 0 ? 'bg-green-100/50 text-green-600 border border-green-200' : 'bg-red-100/50 text-red-600 border border-red-200'}`}>
                          {item.stock} unidades
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <p className="font-black text-gray-900 text-lg">RD$ {item.price.toLocaleString()}</p>
                        {item.originalPrice && <p className="text-xs text-red-400 line-through font-bold">RD$ {item.originalPrice.toLocaleString()}</p>}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => handleEditClick(item)} className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl shadow-sm border border-blue-50 transition-all scale-90 group-hover:scale-100">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteItem(item.id)} className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-2xl shadow-sm border border-red-50 transition-all scale-90 group-hover:scale-100 delay-75">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 && (
            <div className="p-20 text-center">
              <Package className="w-16 h-16 text-blue-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-[#f8fbff] p-4 lg:p-8 pb-24 lg:pb-8 animate-in fade-in duration-500">

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-lg">
        <h1 className="text-xl font-black italic">
          <span className="text-gray-900">La Ganga</span>
          <span className="text-blue-600 ml-2">Admin</span>
        </h1>
        <button
          onClick={onBack}
          className="p-3 bg-blue-50 text-blue-600 rounded-2xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Futuristic Sidebar - Desktop */}
      <aside className={`fixed inset-0 z-50 lg:relative lg:z-0 lg:flex w-full lg:w-72 bg-white/60 backdrop-blur-3xl lg:rounded-[3rem] border-r lg:border border-white shadow-2xl lg:shadow-blue-500/10 p-8 flex-col shrink-0 h-full lg:h-[calc(100vh-4rem)] lg:sticky lg:top-8 overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />


        <div className="mb-12 relative">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-500 hover:text-blue-700 font-black text-xs uppercase tracking-widest mb-6 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter leading-none">
            <span className="text-gray-900 block">La Ganga</span>
            <span className="text-blue-600 block pl-8 -mt-1 drop-shadow-sm">Admin</span>
          </h1>
        </div>

        <nav className="space-y-3 relative flex-1">
          <SidebarButton active={activeTab === 'products'} icon={<Package className="w-5 h-5" />} label="Inventario" onClick={() => setActiveTab('products')} />
          <SidebarButton active={activeTab === 'orders'} icon={<ShoppingBag className="w-5 h-5" />} label="Pedidos" onClick={() => setActiveTab('orders')} />
          <SidebarButton active={activeTab === 'users'} icon={<Users className="w-5 h-5" />} label="Clientes" onClick={() => setActiveTab('users')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-blue-50 relative">
          <div className="bg-blue-50/50 rounded-2xl p-4 mb-4 border border-blue-100/50">
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-1">Sesión activa</p>
            <p className="text-sm font-black text-gray-700">Administrador</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Mobile Close Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-8 right-8 p-2 bg-gray-50 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 flex items-center justify-around">
        <button onClick={() => setActiveTab('products')} className={`p-4 rounded-[2rem] transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'text-gray-400'}`}>
          <Package className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('orders')} className={`p-4 rounded-[2rem] transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'text-gray-400'}`}>
          <ShoppingBag className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('users')} className={`p-4 rounded-[2rem] transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'text-gray-400'}`}>
          <Users className="w-6 h-6" />
        </button>
        <div className="w-px h-8 bg-gray-100 mx-2" />
        <button onClick={openAddModal} className="p-4 bg-blue-50 text-blue-600 rounded-[2rem] hover:bg-blue-100 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {activeTab === 'products' ? (
          renderProducts()
        ) : activeTab === 'orders' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-blue-500/5">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Gestión de Pedidos</h2>
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-blue-600/60 uppercase tracking-widest">Seguimiento en tiempo real</p>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  {ordersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refrescar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ordersError ? (
                <div className="bg-red-50 text-red-600 p-10 rounded-[2.5rem] border border-red-100 text-center flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-black text-sm uppercase tracking-widest mb-4">{ordersError}</p>
                  <button
                    onClick={fetchOrders}
                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all"
                  >
                    Reintentar Conexión
                  </button>
                </div>
              ) : ordersLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white/40 rounded-[2.5rem] border border-white/40">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-blue-500 font-black text-xs uppercase tracking-widest">Sincronizando órdenes...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="group bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                      <div className="p-8">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                              <ShoppingBag className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-1">ID PEDIDO: #{order.id.slice(0, 8)}</p>
                              <p className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-xs tracking-tighter">RD$ {order.total.toLocaleString()}</span>
                                <span className="text-gray-400 font-bold">•</span>
                                <span className="text-sm">Por: {order.shipping_address?.name}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white/60 p-2 rounded-2xl border border-white/80 shadow-sm">
                            {(['pending', 'paid', 'shipped', 'cancelled'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(order.id, status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${order.status === status
                                  ? status === 'shipped' ? 'bg-green-500 text-white shadow-lg shadow-green-200' :
                                    status === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-200' :
                                      'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                  : 'text-gray-400 hover:bg-white hover:text-blue-500'
                                  }`}
                              >
                                {status === 'pending' ? 'Pendiente' :
                                  status === 'paid' ? 'Pagado' :
                                    status === 'shipped' ? 'Enviado' : 'Cancelado'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/40 rounded-3xl p-6 border border-white/40">
                          <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-4">Artículos del Pedido</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex gap-4 p-3 bg-white/60 rounded-2xl border border-white shadow-sm hover:scale-105 transition-transform">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                  <img src={`https://picsum.photos/seed/${item.product_id}/100/100`} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-black text-xs text-gray-900 truncate">ID: {item.product_id.slice(0, 10)}...</p>
                                  <p className="text-blue-600 font-black text-xs mt-1">
                                    {item.quantity} x RD$ {item.price.toLocaleString()}
                                  </p>
                                  <div className="h-0.5 w-full bg-blue-100/50 mt-1" />
                                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Subtotal: RD$ {(item.quantity * item.price).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/50">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{order.shipping_address?.address}, {order.shipping_address?.city}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/50 ml-auto">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-20 text-center border border-white/40 shadow-xl flex flex-col items-center animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 border border-blue-100 shadow-inner">
                        <ShoppingBag className="w-12 h-12 text-blue-200 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Cero Pedidos</h3>
                      <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Aún no se han registrado ventas en el sistema</p>
                      <button
                        onClick={fetchOrders}
                        className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                      >
                        Sincronizar Ahora
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-blue-500/5 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Clientes</h2>
                <p className="text-sm font-bold text-blue-600/60 uppercase tracking-widest">Base de datos de usuarios registrados</p>
              </div>
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Users className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/40 bg-white/20">
                    <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em]">Perfil</th>
                    <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em]">Correo Electrónico</th>
                    <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] text-center">Privilegios</th>
                    <th className="p-6 font-black text-blue-600/40 text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {users.map((u) => (
                    <tr key={u.id} className="group hover:bg-white/50 transition-all duration-300">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-gray-900 block group-hover:text-blue-600 transition-colors">{u.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registrado</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-gray-600 font-bold">{u.email}</td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => onDeleteUser(u.id)} className="p-3 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-2xl border border-red-50 shadow-sm transition-all scale-90 group-hover:scale-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-20 text-center">
                  <Package className="w-16 h-16 text-blue-100 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">Sin usuarios en base de datos</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-xl flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
              <LayoutDashboard className="w-12 h-12 text-blue-300 opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Panel Ejecutivo</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Estadísticas avanzadas próximamente</p>
          </div>
        )}
      </main>

      {/* Glassmorphism Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-blue-900/10 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] w-full max-w-xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="p-10 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <p className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] mt-1 italic">Administración de Catálogo</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-all group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Nombre del Dispositivo</label>
                  <input
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder-gray-300"
                    placeholder="Ej: Samsung Galaxy S24 Ultra"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Marca</label>
                    <input
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                      value={newItem.brand}
                      onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Precio (RD$)</label>
                    <input
                      type="number"
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                      value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Stock Disponible</label>
                    <input
                      type="number"
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                      value={newItem.stock}
                      onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Precio Original (Opcional)</label>
                    <input
                      type="number"
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                      value={newItem.originalPrice}
                      onChange={e => setNewItem({ ...newItem, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Especificaciones Técnicas</label>
                  <textarea
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all h-32 resize-none no-scrollbar placeholder-gray-300 text-sm"
                    placeholder="Describe el procesador, cámara, batería..."
                    value={newItem.specs}
                    onChange={e => setNewItem({ ...newItem, specs: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Identidad Visual</label>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group/img">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-white shadow-lg">
                          {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-100" />
                          )}
                        </div>
                      </div>
                      <label className="flex-1 cursor-pointer group/upload">
                        <div className="h-24 bg-white border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
                          <Upload className="w-6 h-6 text-gray-300 mb-1 group-hover/upload:text-blue-500 group-hover/upload:-translate-y-1 transition-all" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/upload:text-blue-600">Actualizar Media</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 relative">
                <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 group"
                >
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  {editingId ? 'Confirmar Actualización' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
