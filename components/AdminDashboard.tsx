
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
    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 relative group ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-100' : 'group-hover:scale-110'}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className="tracking-tight">{label}</span>
    {active && (
      <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full lg:block" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Inventario de Productos</h2>
            <p className="text-sm font-medium text-gray-400">{filteredItems.length} productos encontrados</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider w-20 text-center">Imagen</th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Detalles del Producto</th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider text-right">Precio</th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => {
                  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                  const imgSrc = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/200/200`;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <img src={imgSrc} className="w-full h-full object-cover" alt="product" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{item.brand}</span>
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{item.specs}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${item.stock > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {item.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                        {item.originalPrice && <p className="text-[10px] text-gray-400 line-through font-medium">{formatCurrency(item.originalPrice)}</p>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard Principal
            </h2>
            <p className="text-sm font-medium text-gray-500">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Sistema Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Ventas Totales', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pedidos Hoy', value: orders.length.toString(), icon: <ShoppingBag className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Clientes', value: users.length.toString(), icon: <Users className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Stock Crítico', value: lowStockCount.toString(), icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tendencia de Ventas</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Últimos 7 días</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                <div className="w-2.5 h-2.5 bg-blue-100 rounded-full" />
              </div>
            </div>
            <div className="h-48 w-full flex items-end justify-between gap-3 relative">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <path
                  d="M0 160 Q 100 140, 200 180 T 400 120 T 600 150 T 800 100"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  className="animate-[dash_3s_ease-in-out_infinite]"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
              </svg>
              {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full bg-blue-50 rounded-t-lg group-hover:bg-blue-100 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">D{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Actividad Reciente</h3>
            <div className="space-y-6 flex-1 text-sm">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex gap-4 group">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">Venta #{order.id.slice(0, 8)}</p>
                    <p className="text-[11px] font-medium text-gray-400">{formatCurrency(order.total)}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full self-center ${order.status === 'pending' ? 'bg-amber-400' : 'bg-green-400'}`} />
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-10 text-center text-gray-400 font-medium text-xs">Sin ventas recientes</div>
              )}
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl text-xs font-bold text-blue-600 transition-all"
            >
              Ver todos los pedidos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Acciones Rápidas</h3>
              <p className="text-sm font-medium text-gray-500">Gestión directa de los módulos principales</p>
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
                  className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-blue-100 rounded-xl transition-all border border-transparent"
                >
                  <span className="text-blue-600">{act.icon}</span>
                  <span className="text-xs font-bold text-gray-700">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBanners = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gestión de Banners</h2>
          <p className="text-sm font-medium text-gray-400">Personaliza el carrusel de inicio</p>
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          <ImageIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Subir Nuevo Banner</h3>
        <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">Imagen del Banner</label>
              <div className="relative group">
                <input type="file" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Subiendo...</span>
                    </div>
                  ) : newBanner.image_url ? (
                    <img src={newBanner.image_url} className="h-full w-full object-cover rounded-lg" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-300 mb-2" />
                      <span className="text-xs font-medium text-gray-400">Clic para subir imagen</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">Etiqueta (Badge)</label>
              <input
                type="text"
                placeholder="Ej: OFERTA, NUEVO, MÁS VENDIDO"
                value={newBanner.badge}
                onChange={(e) => setNewBanner(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">Título</label>
              <input
                type="text"
                placeholder="Ej: iPhone 15 Pro"
                value={newBanner.title}
                onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 ml-1">Subtítulo</label>
              <input
                type="text"
                placeholder="Ej: El smartphone más potente"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!newBanner.image_url || isUploading || isSaving}
              className="w-full mt-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div key={banner.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-[21/9] w-full relative">
              <img src={banner.image_url} className="w-full h-full object-cover" alt={banner.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="inline-block px-2.5 py-1 bg-yellow-400 text-black text-[10px] font-bold rounded-md mb-2 w-fit">{banner.badge}</span>
                <p className="text-white font-bold text-lg leading-none mb-1">{banner.title}</p>
                <p className="text-white/80 font-medium text-xs">{banner.subtitle}</p>
              </div>
              <button
                onClick={() => handleDeleteBanner(banner.id)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && !bannersLoading && (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">No hay banners personalizados</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-[#fcfdfe] p-4 lg:p-8 pb-24 lg:pb-8 animate-in fade-in duration-500">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r border-gray-100 p-6 transition-all duration-300 lg:static lg:block ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <button onClick={onBack} className="mb-10 px-2 text-left hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-blue-600">LA GANGA</span>
              <span className="text-gray-900 ml-1">ADMIN</span>
            </h1>
          </button>
          <div className="flex-1 space-y-1.5">
            <SidebarButton active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Dashboard" onClick={() => setActiveTab('overview')} />
            <SidebarButton active={activeTab === 'products'} icon={<Package />} label="Inventario" onClick={() => setActiveTab('products')} />
            <SidebarButton active={activeTab === 'orders'} icon={<ShoppingBag />} label="Ventas" onClick={() => setActiveTab('orders')} />
            <SidebarButton active={activeTab === 'users'} icon={<Users />} label="Clientes" onClick={() => setActiveTab('users')} />
            <SidebarButton active={activeTab === 'banners'} icon={<ImageIcon />} label="Banners" onClick={() => setActiveTab('banners')} />
          </div>
          <button onClick={onLogout} className="mt-8 w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LayoutDashboard className="w-5 h-5 rotate-180" />
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
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Historial de Ventas</h2>
                    <p className="text-sm font-medium text-gray-400">{orders.length} pedidos registrados</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="grid gap-4">
                  {orders.map(o => (
                    <div key={o.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">ORDEN #{o.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <p className="text-xs font-medium">{new Date(o.created_at).toLocaleString('es-ES')}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <p className="font-bold text-lg text-gray-900">{formatCurrency(o.total)}</p>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
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
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Base de Clientes</h2>
                      <p className="text-sm font-medium text-gray-400">{users.length} usuarios registrados</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                          <th className="px-6 py-4">Nombre de Usuario</th>
                          <th className="px-6 py-4">Correo Electrónico</th>
                          <th className="px-6 py-4 text-right">Gestión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{u.name}</td>
                            <td className="px-6 py-4 text-gray-500 font-medium text-sm">{u.email}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => onDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        <div className="fixed inset-0 z-[100] bg-gray-900/10 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-center">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left ml-1">Foto del Producto</label>
                <div className="relative group">
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                  <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain p-2" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-xs font-semibold text-gray-400">Seleccionar Imagen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre del Dispositivo</label>
                <input
                  className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-100 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 font-semibold text-sm transition-all"
                  placeholder="Ej: iPhone 15 Pro Max"
                  value={newItem.name}
                  required
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Precio (DOP)</label>
                  <input
                    className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-100 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 font-semibold text-sm transition-all"
                    placeholder="0.00"
                    type="number"
                    value={newItem.price}
                    required
                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Stock Inicial</label>
                  <input
                    className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-100 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 font-semibold text-sm transition-all"
                    placeholder="0"
                    type="number"
                    value={newItem.stock}
                    onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Especificaciones Técnicas</label>
                <textarea
                  className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-100 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 font-semibold text-sm h-28 resize-none transition-all"
                  placeholder="Ej: 256GB, Color Titanio, Salud 100%..."
                  value={newItem.specs}
                  onChange={e => setNewItem({ ...newItem, specs: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all mt-2"
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
