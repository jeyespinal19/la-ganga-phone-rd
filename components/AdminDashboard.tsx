
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
  MapPin,
  Image as ImageIcon,
  PlusCircle
} from 'lucide-react';
import { Product, User, Order, Banner } from '../types';
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

type Tab = 'overview' | 'products' | 'users' | 'orders' | 'banners';

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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id' | 'created_at'>>({
    image_url: '',
    title: '',
    subtitle: '',
    badge: 'OFERTA',
    active: true,
    order: 0
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'banners') {
      fetchBanners();
    }
  }, [activeTab]);

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const data = await productService.getBanners();
      setBanners(data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await productService.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrdersError(err.message || 'Error al cargar los pedidos');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vista previa local inmediata
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBanner(prev => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    console.log('Iniciando subida de banner...');
    try {
      const url = await productService.uploadBannerImage(file);
      console.log('Banner subido con éxito:', url);
      setNewBanner(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      console.error('Error de subida detallado:', err);
      alert(`Error crítico al subir la imagen: ${err.message || 'Error desconocido'}. Revisa que el bucket "banners" exista.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image_url) {
      alert('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsSaving(true);
    try {
      await productService.addBanner(newBanner);
      setNewBanner({
        image_url: '',
        title: '',
        subtitle: '',
        badge: 'OFERTA',
        active: true,
        order: 0
      });
      fetchBanners();
      alert('Banner añadido correctamente.');
    } catch (err: any) {
      console.error('Error adding banner:', err);
      alert(`Error al añadir el banner: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('¿Borrar este banner?')) return;
    try {
      await productService.deleteBanner(id);
      fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
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

  // Form State for Products
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
    setNewItem({ name: '', brand: 'Samsung', specs: '', price: '', originalPrice: '', stock: '0' });
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
      imageDetails: imagePreview || '1'
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
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStockCount = items.filter(i => i.stock <= 3).length;
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
              ¡Hola de nuevo, <span className="text-blue-600">Admin</span>! 👋
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{today}</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Sistema Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Ventas Totales', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-6 h-6" />, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-200' },
            { label: 'Pedidos Hoy', value: orders.length.toString(), icon: <ShoppingBag className="w-6 h-6" />, color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-200' },
            { label: 'Clientes', value: users.length.toString(), icon: <Users className="w-6 h-6" />, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-200' },
            { label: 'Stock Crítico', value: lowStockCount.toString(), icon: <AlertCircle className="w-6 h-6" />, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-200' },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden bg-white rounded-[2.5rem] p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${stat.shadow}`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/40 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900">Tendencia de Ventas</h3>
                <p className="text-xs font-bold text-blue-500/60 uppercase tracking-widest">Últimos 7 días</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div className="w-3 h-3 bg-blue-200 rounded-full" />
              </div>
            </div>
            <div className="h-48 w-full flex items-end justify-between gap-2 relative">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <path
                  d="M0 160 Q 100 140, 200 180 T 400 120 T 600 150 T 800 100"
                  fill="none"
                  stroke="url(#gradient-overview)"
                  strokeWidth="4"
                  className="animate-[dash_3s_ease-in-out_infinite]"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
                <defs>
                  <linearGradient id="gradient-overview" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full bg-blue-500/10 rounded-t-xl group-hover:bg-blue-500/20 transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-400">D{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/40 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6">Actividad Reciente</h3>
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">Venta de {order.total.toLocaleString()} DOP</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full self-center ${order.status === 'pending' ? 'bg-amber-400' : 'bg-green-400'}`} />
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Sin ventas recientes</div>
              )}
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="w-full mt-8 py-3 bg-white/60 border border-white hover:bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all"
            >
              Ver todos los pedidos
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black mb-2">Acciones Rápidas</h3>
              <p className="text-blue-100 font-bold opacity-80">Gestiona tu tienda de manera eficiente</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
              {[
                { label: 'Producto', icon: <PlusCircle className="w-5 h-5" />, action: openAddModal },
                { label: 'Banners', icon: <ImageIcon className="w-5 h-5" />, action: () => setActiveTab('banners') },
                { label: 'Ordenes', icon: <ShoppingBag className="w-5 h-5" />, action: () => setActiveTab('orders') },
                { label: 'Clientes', icon: <Users className="w-5 h-5" />, action: () => setActiveTab('users') },
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={act.action}
                  className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95"
                >
                  {act.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBanners = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-blue-500/5 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestión de Banners</h2>
          <p className="text-sm font-bold text-blue-600/60 uppercase tracking-widest">Personaliza el carrusel de inicio</p>
        </div>
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <ImageIcon className="w-7 h-7" />
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl">
        <h3 className="text-xl font-black text-gray-900 mb-6">Subir Nuevo Banner (Canva)</h3>
        <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1.5 ml-1">Imagen del Banner</label>
              <div className="relative group">
                <input type="file" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                <div className="w-full h-32 bg-white/60 border-2 border-dashed border-blue-100 rounded-2xl flex flex-col items-center justify-center group-hover:bg-blue-50 transition-colors">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Subiendo...</span>
                    </div>
                  ) : newBanner.image_url ? (
                    <img src={newBanner.image_url} className="h-full w-full object-cover rounded-2xl" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-blue-300 mb-2" />
                      <span className="text-xs font-bold text-blue-400">Seleccionar imagen o soltar aquí</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1.5 ml-1">Etiqueta (Badge)</label>
              <input
                type="text"
                placeholder="Ej: OFERTA, NUEVO, MÁS VENDIDO"
                value={newBanner.badge}
                onChange={(e) => setNewBanner(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full bg-white/60 border-none rounded-xl px-4 py-3 text-sm font-bold placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1.5 ml-1">Título</label>
              <input
                type="text"
                placeholder="Ej: iPhone 15 Pro"
                value={newBanner.title}
                onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white/60 border-none rounded-xl px-4 py-3 text-sm font-bold placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1.5 ml-1">Subtítulo</label>
              <input
                type="text"
                placeholder="Ej: El smartphone más potente"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-white/60 border-none rounded-xl px-4 py-3 text-sm font-bold placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!newBanner.image_url || isUploading || isSaving}
              className="w-full mt-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : 'Añadir al Carrusel'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="group relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/40 shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="aspect-[21/9] w-full relative">
              <img src={banner.image_url} className="w-full h-full object-cover" alt={banner.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-[9px] font-black rounded-lg mb-2 w-fit">{banner.badge}</span>
                <p className="text-white font-black text-xl leading-none mb-1">{banner.title}</p>
                <p className="text-white/80 font-bold text-xs">{banner.subtitle}</p>
              </div>
              <button
                onClick={() => handleDeleteBanner(banner.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && !bannersLoading && (
          <div className="col-span-full py-20 bg-white/40 rounded-[2.5rem] border border-white/40 text-center flex flex-col items-center">
            <ImageIcon className="w-16 h-16 text-blue-200 mb-4 animate-pulse" />
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No hay banners personalizados</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-[#f8fbff] p-4 lg:p-8 pb-24 lg:pb-8 animate-in fade-in duration-500">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white/80 backdrop-blur-2xl border-r border-white/40 p-6 transition-all duration-500 lg:static lg:block ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <button onClick={onBack} className="mb-10 px-4 text-left hover:opacity-70 transition-opacity active:scale-95 duration-200">
            <h1 className="text-2xl font-black italic tracking-tighter">
              <span className="text-gray-900 leading-none">LA GANGA</span><br />
              <span className="text-blue-600 leading-none text-3xl">ADMIN</span>
            </h1>
          </button>
          <div className="flex-1 space-y-3">
            <SidebarButton active={activeTab === 'overview'} icon={<LayoutDashboard className="w-6 h-6" />} label="Dashboard" onClick={() => setActiveTab('overview')} />
            <SidebarButton active={activeTab === 'products'} icon={<Package className="w-6 h-6" />} label="Inventario" onClick={() => setActiveTab('products')} />
            <SidebarButton active={activeTab === 'orders'} icon={<ShoppingBag className="w-6 h-6" />} label="Ventas" onClick={() => setActiveTab('orders')} />
            <SidebarButton active={activeTab === 'users'} icon={<Users className="w-6 h-6" />} label="Clientes" onClick={() => setActiveTab('users')} />
            <SidebarButton active={activeTab === 'banners'} icon={<ImageIcon className="w-6 h-6" />} label="Banners" onClick={() => setActiveTab('banners')} />
          </div>
          <button onClick={onLogout} className="mt-8 w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all">
            <LayoutDashboard className="w-6 h-6 rotate-180" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center justify-between bg-white/60 backdrop-blur-xl p-4 rounded-2xl mb-4 border border-white">
          <button onClick={onBack} className="font-black italic text-gray-900 hover:opacity-70 transition-opacity active:scale-95 duration-200">LA GANGA ADMIN</button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-blue-50 rounded-xl text-blue-600"><LayoutDashboard className="w-6 h-6" /></button>
        </div>

        {activeTab === 'overview' ? renderOverview() :
          activeTab === 'products' ? renderProducts() :
            activeTab === 'orders' ? (
              <div className="space-y-6">
                <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40">
                  <h2 className="text-3xl font-black text-gray-900">Ventas</h2>
                </div>
                {/* Simplified Order View for robustness */}
                <div className="grid gap-4">
                  {orders.map(o => (
                    <div key={o.id} className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-blue-600">ORDEN #{o.id.slice(0, 8)}</p>
                          <p className="text-sm font-bold text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl">RD$ {o.total.toLocaleString()}</p>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="mt-1 bg-blue-50 border-none rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagado</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) :
              activeTab === 'users' ? (
                <div className="space-y-6">
                  <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40">
                    <h2 className="text-3xl font-black text-gray-900">Clientes</h2>
                  </div>
                  <div className="bg-white/40 rounded-[2.5rem] overflow-hidden border border-white">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/20">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-white/50 transition-all">
                            <td className="p-6 font-black">{u.name}</td>
                            <td className="p-6 text-gray-500 font-bold">{u.email}</td>
                            <td className="p-6 text-right">
                              <button onClick={() => onDeleteUser(u.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) :
                activeTab === 'banners' ? renderBanners() :
                  <div className="p-20 text-center bg-white/40 rounded-[3rem] border border-white">
                    <LayoutDashboard className="w-12 h-12 text-blue-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black">Panel General</h3>
                  </div>
        }
      </main>

      {/* Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-blue-900/20 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">{editingId ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 ring-blue-500/20 font-bold"
                placeholder="Nombre"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 ring-blue-500/20 font-bold"
                  placeholder="Precio"
                  type="number"
                  value={newItem.price}
                  onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                />
                <input
                  className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 ring-blue-500/20 font-bold"
                  placeholder="Stock"
                  type="number"
                  value={newItem.stock}
                  onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                />
              </div>
              <textarea
                className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 ring-blue-500/20 font-bold h-32"
                placeholder="Especificaciones"
                value={newItem.specs}
                onChange={e => setNewItem({ ...newItem, specs: e.target.value })}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};
