
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  X,
  Save,
  ChevronRight,
  MoreVertical,
  Filter,
  Upload,
  Edit,
  History,
  GripVertical,
  Trophy,
  MessageCircle,
  Calendar,
  Eye,
  Smartphone,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AuctionItem, User, ActivityLog, BidHistoryItem } from '../types';
import { mockSocket } from '../services/mockSocket';
import { auctionService } from '../services/auctionService';

interface AdminDashboardProps {
  items: AuctionItem[];
  users: User[];
  activityLog: ActivityLog[];
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  onAddItem: (newItem: Omit<AuctionItem, 'id'>) => void;
  onEditItem: (id: string, updatedFields: Partial<AuctionItem>) => void;
  onReorderItems: (newOrder: AuctionItem[]) => void;
  onDeleteItem: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onBack: () => void;
}

type Tab = 'overview' | 'products' | 'users';

interface WinningItemDetail {
  id: string;
  name: string;
  brand: string;
  specs: string;
  imageDetails: string;
  price: number;
  date: string;
  winnerName: string;
}

const ROW_HEIGHT = 88; // Height of a table row in pixels

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  users,
  activityLog,
  isSimulationActive,
  onToggleSimulation,
  onAddItem,
  onEditItem,
  onReorderItems,
  onDeleteItem,
  onDeleteUser,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Virtualization State
  const [productScrollTop, setProductScrollTop] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Drag and Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // New/Edit Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    brand: 'Oukitel',
    specs: '',
    currentBid: '',
    reservePrice: '',
    days: '7'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ name: string, history: BidHistoryItem[] } | null>(null);

  // Winning Product Detail Modal State
  const [selectedWinningDetail, setSelectedWinningDetail] = useState<WinningItemDetail | null>(null);

  // Reset scroll when search changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
      setProductScrollTop(0);
    }
  }, [searchTerm]);

  // Calculate Winner Stats
  // NOTE: This currently relies on mockSocket's synchronous history.
  // If running with Supabase, this would need to fetch history async.
  // However, since auctionService falls back to mockSocket if Supabase fails, 
  // this will work for the 'broken config' state.
  const winnerStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number; items: WinningItemDetail[] }> = {};

    items.forEach(item => {
      // In a real async scenario, we'd need to fetch this data differently.
      // For now, we rely on the local socket cache which is populated in fallback mode.
      const history = mockSocket.getBidHistory(item.id);

      if (history.length > 0) {
        const topBidder = history[0]; // The winner
        const userId = topBidder.userId;

        if (!stats[userId]) {
          stats[userId] = { count: 0, total: 0, items: [] };
        }
        stats[userId].count += 1;
        stats[userId].total += topBidder.amount;
        stats[userId].items.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          specs: item.specs,
          imageDetails: item.imageDetails,
          price: topBidder.amount,
          date: topBidder.timestamp,
          winnerName: topBidder.userName
        });
      }
    });
    return stats;
  }, [items]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newItem.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio.';
    }

    if (!newItem.brand.trim()) {
      newErrors.brand = 'La marca es obligatoria.';
    }

    if (!newItem.currentBid) {
      newErrors.currentBid = 'El precio inicial es obligatorio.';
    } else if (isNaN(Number(newItem.currentBid)) || Number(newItem.currentBid) < 0) {
      newErrors.currentBid = 'Ingrese un precio válido.';
    }

    if (newItem.reservePrice && (isNaN(Number(newItem.reservePrice)) || Number(newItem.reservePrice) < 0)) {
      newErrors.reservePrice = 'El precio de reserva debe ser un número válido.';
    }

    if (!newItem.specs.trim()) {
      newErrors.specs = 'Las especificaciones son obligatorias.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddModal = () => {
    setNewItem({ name: '', brand: 'Oukitel', specs: '', currentBid: '', reservePrice: '', days: '7' });
    setImagePreview(null);
    setEditingId(null);
    setErrors({});
    setShowAddModal(true);
  };

  const handleEditClick = (item: AuctionItem) => {
    // Extract days from "7d 0h restantes" string
    const daysMatch = item.timeLeft.match(/(\d+)d/);
    const days = daysMatch ? daysMatch[1] : '7';

    setNewItem({
      name: item.name,
      brand: item.brand,
      specs: item.specs,
      currentBid: item.currentBid.toString(),
      reservePrice: item.reservePrice ? item.reservePrice.toString() : '',
      days: days
    });
    setImagePreview(item.imageDetails);
    setEditingId(item.id);
    setErrors({});
    setShowAddModal(true);
  };

  const handleViewHistory = async (item: AuctionItem) => {
    // Use auctionService to fetch history (supports both Supabase and Mock)
    const history = await auctionService.getBidHistory(item.id);
    setSelectedHistoryItem({
      name: item.name,
      history: history
    });
    setShowHistoryModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const itemData = {
      name: newItem.name,
      brand: newItem.brand,
      specs: newItem.specs,
      currentBid: Number(newItem.currentBid),
      reservePrice: newItem.reservePrice ? Number(newItem.reservePrice) : undefined,
      timeLeft: `${newItem.days}d 0h restantes`,
      imageDetails: imagePreview || '' // Pass the base64 string or empty (will fallback to seed in App.tsx)
    };

    if (editingId) {
      onEditItem(editingId, itemData);
    } else {
      onAddItem(itemData);
    }

    setShowAddModal(false);
    setNewItem({ name: '', brand: 'Oukitel', specs: '', currentBid: '', reservePrice: '', days: '7' });
    setImagePreview(null);
    setEditingId(null);
    setErrors({});
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    // Set drag image or effect
    e.dataTransfer.effectAllowed = 'move';
    // Optional: make the drag image transparent or different
    const row = e.currentTarget as HTMLElement;
    row.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItemId(null);
    const row = e.currentTarget as HTMLElement;
    row.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItemId || draggedItemId === targetId) return;

    // We can only reorder effectively if we are looking at the full list or handling state carefully
    // To keep it simple and robust, we find indices in the MAIN items array
    const sourceIndex = items.findIndex(i => i.id === draggedItemId);
    const targetIndex = items.findIndex(i => i.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);

      onReorderItems(newItems);
    }
    setDraggedItemId(null);
  };

  const totalValue = items.reduce((acc, item) => acc + item.currentBid, 0);

  // --- Render Sections ---

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-app-text tracking-tight">Resumen General</h2>
          <p className="text-app-muted text-sm mt-1">Bienvenido de nuevo, aquí está lo que sucede hoy.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleSimulation}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm border flex items-center gap-2
               ${isSimulationActive
                ? 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20'
                : 'bg-app-card text-app-muted border-app-border hover:bg-app-border'
              }`}
            title={isSimulationActive ? "Pausar puja automática" : "Activar puja automática"}
          >
            {isSimulationActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            Simulación
          </button>
          <button className="px-4 py-2 bg-app-card border border-app-border rounded-lg text-sm font-medium text-app-text hover:bg-app-border transition-colors flex items-center gap-2 shadow-sm">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button className="px-4 py-2 bg-app-accent text-white rounded-lg text-sm font-medium hover:bg-app-accentHover transition-all shadow-lg shadow-app-accent/20 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards - Elegant Glassmorphism Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Ingresos Totales",
            value: `DOP ${totalValue.toLocaleString()}`,
            trend: "+12.5%",
            icon: DollarSign,
            color: "from-emerald-500/20 to-emerald-500/5",
            text: "text-emerald-500",
            bgIcon: "bg-emerald-500/20"
          },
          {
            title: "Subastas Activas",
            value: items.length,
            trend: `+${activityLog.filter(l => l.type === 'new_item').length} nuevos`,
            icon: Package,
            color: "from-blue-500/20 to-blue-500/5",
            text: "text-blue-500",
            bgIcon: "bg-blue-500/20"
          },
          {
            title: "Usuarios Activos",
            value: users.length,
            trend: "+18% vs mes anterior",
            icon: Users,
            color: "from-violet-500/20 to-violet-500/5",
            text: "text-violet-500",
            bgIcon: "bg-violet-500/20"
          },
        ].map((stat, i) => (
          <div key={i} className="group relative bg-app-card border border-app-border rounded-2xl p-6 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bgIcon} ${stat.text}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-app-bg border border-app-border ${stat.text}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-app-text tracking-tight mb-1">{stat.value}</h3>
              <p className="text-app-muted text-sm font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-app-card border border-app-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-app-text">Actividad de Pujas</h3>
            <select className="bg-app-bg border border-app-border text-xs rounded-lg px-2 py-1 text-app-muted outline-none">
              <option>Últimos 7 días</option>
              <option>Este mes</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {[35, 55, 40, 70, 50, 85, 60, 95, 75, 55, 65, 80].map((h, i) => (
              <div key={i} className="w-full relative group">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-app-accent/80 rounded-t-sm transition-all duration-500 group-hover:bg-app-accent group-hover:shadow-[0_0_15px_rgba(14,165,233,0.5)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  DOP {(h * 150).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-app-muted mt-4 font-semibold tracking-wider uppercase">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-app-text mb-6">Actividad Reciente</h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px]">
            {activityLog.length > 0 ? activityLog.slice(0, 8).map((log, i) => (
              <div key={log.id} className="flex gap-4 relative pl-4 border-l border-app-border/50">
                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-app-card ${log.type === 'new_item' ? 'bg-green-500' : 'bg-app-accent'}`}></div>
                <div>
                  <p className="text-sm text-app-text font-medium leading-none mb-1">
                    {log.type === 'new_item' ? 'Nuevo Producto' : 'Nueva Puja'}
                  </p>
                  <p className="text-xs text-app-muted line-clamp-2">{log.message}</p>
                  <span className="text-[10px] text-app-muted/60 mt-1 block">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-app-muted py-10">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Sin actividad reciente</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-semibold text-app-muted hover:text-app-accent border-t border-app-border transition-colors">
            Ver todo el historial
          </button>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Disable drag if searching, to prevent confusion in ordering
    const isDragEnabled = searchTerm === '';

    // Virtualization Calculations
    const containerHeight = 600; // Fixed max-height for the container
    const totalContentHeight = filteredItems.length * ROW_HEIGHT;

    // Calculate start and end indices with buffer
    const startIndex = Math.max(0, Math.floor(productScrollTop / ROW_HEIGHT));
    const endIndex = Math.min(
      filteredItems.length,
      Math.ceil((productScrollTop + containerHeight) / ROW_HEIGHT) + 1 // +1 buffer
    );

    const visibleItems = filteredItems.slice(startIndex, endIndex);

    // Create spacers to emulate total height
    const paddingTop = startIndex * ROW_HEIGHT;
    const paddingBottom = (filteredItems.length - endIndex) * ROW_HEIGHT;

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setProductScrollTop(e.currentTarget.scrollTop);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-app-text">Gestión de Inventario</h2>
            <p className="text-app-muted text-sm mt-1">{items.length} productos listados actualmente</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-app-accent hover:bg-app-accentHover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-app-accent/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-app-card border border-app-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-app-text focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/50 transition-all"
            />
          </div>
        </div>

        {/* Virtualized Table Container */}
        <div
          ref={tableContainerRef}
          onScroll={onScroll}
          className="bg-app-card border border-app-border rounded-2xl shadow-sm overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar"
        >
          <div className="min-w-[800px]">
            <table className="w-full text-left text-sm relative border-collapse">
              <thead className="bg-app-card border-b border-app-border sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider w-10 bg-app-card"></th>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider w-20 bg-app-card">Imagen</th>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider bg-app-card">Detalles del Producto</th>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider bg-app-card">Estado</th>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider text-right bg-app-card">Precio Actual</th>
                  <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider text-right bg-app-card">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {/* Top Spacer */}
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} colSpan={6}></td>
                  </tr>
                )}

                {visibleItems.map((item) => {
                  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                  const imgSrc = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/100/100`;
                  const isDragging = draggedItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`group transition-colors h-[88px] ${isDragging ? 'bg-app-accent/10 opacity-50' : 'hover:bg-app-bg/50'}`}
                      draggable={isDragEnabled}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <td className="p-4 w-10 text-center">
                        <div
                          className={`p-2 rounded cursor-grab active:cursor-grabbing text-app-muted hover:text-app-text transition-colors ${!isDragEnabled && 'opacity-30 cursor-not-allowed'}`}
                          title={isDragEnabled ? "Arrastrar para reordenar" : "Filtro activo - reordenamiento deshabilitado"}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 bg-app-image-bg rounded-xl border border-app-border flex items-center justify-center p-1 relative overflow-hidden">
                          <img src={imgSrc} className="max-w-full max-h-full object-contain mix-blend-normal" alt="mini" />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-app-text text-base">{item.name}</p>
                        <p className="text-app-muted text-xs flex items-center gap-2 mt-0.5">
                          <span className="bg-app-badge-bg px-1.5 py-0.5 rounded border border-app-border">{item.brand}</span>
                          <span>•</span>
                          <span>ID: #{item.id}</span>
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Activo
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-mono text-app-text font-bold text-base">DOP {item.currentBid.toLocaleString()}</p>
                        <p className="text-[10px] text-app-muted">{item.timeLeft}</p>
                        {item.reservePrice && (
                          <div className="mt-1 flex justify-end">
                            <span className="text-[10px] text-blue-500 font-bold border border-blue-500 rounded px-1.5 py-0.5 shadow-sm shadow-blue-500/20">
                              Reserva: DOP {item.reservePrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewHistory(item)}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                            title="Ver Historial"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-app-accent hover:bg-app-accent/10 rounded-lg transition-colors border border-transparent hover:border-app-accent/20"
                            title="Editar Subasta"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title="Eliminar Subasta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Bottom Spacer */}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: `${paddingBottom}px` }} colSpan={6}></td>
                  </tr>
                )}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-app-muted">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  };

  const renderUsers = () => {
    // Only show users who are currently winning at least one auction
    const winningUsers = users.filter(u => {
      const stats = winnerStats[u.id];
      return stats && stats.count > 0;
    });

    const filteredUsers = winningUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.includes(searchTerm));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-app-text">Clientes Ganadores</h2>
            <p className="text-app-muted text-sm mt-1">Lista detallada de usuarios y sus subastas ganadas.</p>
          </div>
          <button className="px-4 py-2 bg-app-card border border-app-border rounded-lg text-sm font-medium text-app-text hover:bg-app-border transition-colors flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Descargar CSV
          </button>
        </div>

        <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden shadow-sm">
          {/* Header Controls */}
          <div className="p-5 border-b border-app-border flex gap-4 bg-app-bg/30">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-xl pl-10 pr-4 py-2 text-sm text-app-text focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/50"
              />
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-app-bg/50 border-b border-app-border">
              <tr>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider w-16">
                  <div className="w-4 h-4 border border-app-muted/50 rounded flex items-center justify-center cursor-pointer"></div>
                </th>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider">Perfil</th>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider">Productos Ganando</th>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider">Total Comprometido</th>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider">Estado</th>
                <th className="p-5 font-semibold text-app-muted text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filteredUsers.map((u) => {
                const stats = winnerStats[u.id] || { count: 0, total: 0, items: [] };
                const isWinning = stats.count > 0;

                return (
                  <tr key={u.id} className={`group transition-colors ${isWinning ? 'bg-app-accent/5 hover:bg-app-accent/10' : 'hover:bg-app-bg/50'}`}>
                    <td className="p-5">
                      <div className="w-4 h-4 border border-app-muted/50 rounded flex items-center justify-center cursor-pointer hover:border-app-accent"></div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-app-border to-app-card border border-app-border flex items-center justify-center text-xs font-bold text-app-muted shadow-sm overflow-hidden relative">
                          <img src={`https://picsum.photos/seed/${u.avatar}/100/100`} alt="u" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div>
                          <p className="font-bold text-app-text text-sm flex items-center gap-1">
                            {u.name}
                            {isWinning && <Trophy className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                          </p>
                          <p className="text-xs text-app-muted">{u.email}</p>
                          {/* Phone & Whatsapp */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-app-muted font-mono">{u.phone || '+1 (829) 000-0000'}</span>
                            <a
                              href={`https://wa.me/${(u.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-green-500 hover:text-green-400 p-0.5 rounded-full hover:bg-green-500/10 transition-colors"
                              title="Contactar por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      {isWinning ? (
                        <div className="flex flex-col gap-2">
                          {stats.items.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedWinningDetail(item)}
                              className="bg-app-bg border border-app-border rounded-lg p-2.5 shadow-sm hover:border-app-accent/50 cursor-pointer transition-colors group/item"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-app-text truncate max-w-[150px] group-hover/item:text-app-accent transition-colors" title={item.name}>{item.name}</span>
                                <span className="text-xs font-mono font-bold text-green-500 ml-2">DOP {item.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-app-muted">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-app-muted text-xs">Sin victorias</span>
                      )}
                    </td>
                    <td className="p-5 font-mono text-sm font-semibold">
                      {stats.total > 0 ? (
                        <span className="text-app-text">DOP {stats.total.toLocaleString()}</span>
                      ) : (
                        <span className="text-app-muted">-</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${u.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        u.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                        {u.status === 'active' ? 'Activo' : u.status === 'pending' ? 'Pendiente' : 'Baneado'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(u.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-app-muted">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No se encontraron clientes ganadores
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 border-t border-app-border flex justify-between items-center bg-app-bg/30">
            <span className="text-xs text-app-muted">Mostrando {filteredUsers.length} de {winningUsers.length} clientes ganadores</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-app-border rounded hover:bg-app-bg text-app-muted">Anterior</button>
              <button className="px-3 py-1 text-xs bg-app-accent text-white rounded shadow-sm">1</button>
              <button className="px-3 py-1 text-xs border border-app-border rounded hover:bg-app-bg text-app-muted">2</button>
              <button className="px-3 py-1 text-xs border border-app-border rounded hover:bg-app-bg text-app-muted">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">

      {/* Sidebar Navigation - Elegant Style */}
      <aside className="w-full lg:w-64 bg-app-card/50 backdrop-blur-xl border border-app-border rounded-2xl p-4 flex flex-col shrink-0 lg:sticky lg:top-4 h-fit">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-sm font-bold text-app-muted uppercase tracking-wider mb-1">Menu</h2>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
            { id: 'products', label: 'Productos', icon: Package },
            { id: 'users', label: 'Clientes Ganadores', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${activeTab === item.id
                  ? 'bg-app-accent text-white shadow-lg shadow-app-accent/25'
                  : 'text-app-muted hover:bg-app-bg hover:text-app-text'
                }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-80" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-app-border px-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white opacity-20 rounded-full blur-xl"></div>
            <h4 className="font-bold text-sm mb-1 relative z-10">Plan Pro</h4>
            <p className="text-xs opacity-80 mb-3 relative z-10">Acceso total habilitado</p>
            <div className="h-1 bg-white/30 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-white w-3/4"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'users' && renderUsers()}
      </main>

      {/* Elegant Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-app-card w-full max-w-lg rounded-2xl border border-app-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="bg-gradient-to-r from-app-card to-app-bg p-6 border-b border-app-border flex justify-between items-center sticky top-0 z-50">
              <div>
                <h3 className="text-lg font-bold text-app-text">{editingId ? 'Editar Subasta' : 'Nueva Subasta'}</h3>
                <p className="text-xs text-app-muted">Complete los detalles para {editingId ? 'actualizar' : 'publicar'}.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-app-border rounded-full text-app-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Imagen del Producto</label>
                <div className="border-2 border-dashed border-app-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-app-bg/50 transition-colors relative cursor-pointer group h-40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white text-xs font-bold">Cambiar imagen</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-app-card border border-app-border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload className="w-6 h-6 text-app-accent" />
                      </div>
                      <p className="text-sm text-app-text font-medium">Haga clic o arrastre</p>
                      <p className="text-xs text-app-muted">PNG, JPG hasta 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Samsung Galaxy S24 Ultra"
                  className={`w-full bg-app-bg border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none transition-all placeholder:text-app-muted/50 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-app-border focus:border-app-accent focus:ring-1 focus:ring-app-accent/50'}`}
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Marca</label>
                    <div className="relative">
                      <input
                        list="brands-list"
                        type="text"
                        className={`w-full bg-app-bg border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none transition-all ${errors.brand ? 'border-red-500 focus:border-red-500' : 'border-app-border focus:border-app-accent focus:ring-1 focus:ring-app-accent/50'}`}
                        value={newItem.brand}
                        onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                        placeholder="Seleccionar o escribir..."
                      />
                      <datalist id="brands-list">
                        <option value="Oukitel" />
                        <option value="Samsung" />
                        <option value="Xiaomi" />
                        <option value="Apple" />
                      </datalist>
                    </div>
                    {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Precio de Reserva ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
                      <input
                        type="number"
                        min="0"
                        className={`w-full bg-app-bg border rounded-xl pl-10 pr-4 py-3 text-sm text-app-text focus:outline-none transition-all ${errors.reservePrice ? 'border-red-500 focus:border-red-500' : 'border-app-border focus:border-app-accent focus:ring-1 focus:ring-app-accent/50'}`}
                        value={newItem.reservePrice}
                        onChange={e => setNewItem({ ...newItem, reservePrice: e.target.value })}
                      />
                    </div>
                    {errors.reservePrice && <p className="text-red-500 text-xs mt-1">{errors.reservePrice}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Precio Inicial ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
                    <input
                      required
                      type="number"
                      min="0"
                      className={`w-full bg-app-bg border rounded-xl pl-10 pr-4 py-3 text-sm text-app-text focus:outline-none transition-all ${errors.currentBid ? 'border-red-500 focus:border-red-500' : 'border-app-border focus:border-app-accent focus:ring-1 focus:ring-app-accent/50'}`}
                      value={newItem.currentBid}
                      onChange={e => setNewItem({ ...newItem, currentBid: e.target.value })}
                    />
                  </div>
                  {errors.currentBid && <p className="text-red-500 text-xs mt-1">{errors.currentBid}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Especificaciones</label>
                <input
                  type="text"
                  placeholder="Ej. 12GB RAM, 512GB Storage"
                  className={`w-full bg-app-bg border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none transition-all ${errors.specs ? 'border-red-500 focus:border-red-500' : 'border-app-border focus:border-app-accent focus:ring-1 focus:ring-app-accent/50'}`}
                  value={newItem.specs}
                  onChange={e => setNewItem({ ...newItem, specs: e.target.value })}
                />
                {errors.specs && <p className="text-red-500 text-xs mt-1">{errors.specs}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Duración (Días)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    className="flex-1 h-2 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-accent"
                    value={newItem.days}
                    onChange={e => setNewItem({ ...newItem, days: e.target.value })}
                  />
                  <span className="text-sm font-bold text-app-text w-12 text-center border border-app-border rounded px-2 py-1">{newItem.days}d</span>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-app-border text-app-text font-medium hover:bg-app-bg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-app-accent text-white font-medium hover:bg-app-accentHover flex items-center justify-center gap-2 shadow-lg shadow-app-accent/20 transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" /> {editingId ? 'Guardar Cambios' : 'Publicar Subasta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-app-card w-full max-w-2xl rounded-2xl border border-app-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-app-card to-app-bg p-6 border-b border-app-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-app-text">Historial de Pujas</h3>
                <p className="text-xs text-app-muted">Producto: {selectedHistoryItem.name}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-app-border rounded-full text-app-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-app-bg/50 border-b border-app-border sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="p-4 font-semibold text-app-muted">Usuario</th>
                    <th className="p-4 font-semibold text-app-muted text-right">Monto</th>
                    <th className="p-4 font-semibold text-app-muted text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {selectedHistoryItem.history.map((bid, i) => (
                    <tr key={i} className="hover:bg-app-bg/50 transition-colors">
                      <td className="p-4 font-medium text-app-text flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-app-border flex items-center justify-center text-[10px] text-app-muted font-bold">
                          {bid.userName.charAt(0)}
                        </div>
                        {bid.userName}
                      </td>
                      <td className="p-4 text-right font-mono text-app-text font-bold">
                        DOP {bid.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-xs text-app-muted">
                        {new Date(bid.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {selectedHistoryItem.history.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-app-muted">
                        No hay historial disponible para este producto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-app-border flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-app-card border border-app-border text-app-text hover:bg-app-bg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winning Product Details Modal */}
      {selectedWinningDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-app-card w-full max-w-md rounded-2xl border border-app-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="relative h-48 bg-app-image-bg flex items-center justify-center p-6">
              <button
                onClick={() => setSelectedWinningDetail(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedWinningDetail.imageDetails.startsWith('data:') || selectedWinningDetail.imageDetails.startsWith('http') ? (
                <img src={selectedWinningDetail.imageDetails} alt={selectedWinningDetail.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <img src={`https://picsum.photos/seed/${selectedWinningDetail.imageDetails}/400/300`} alt={selectedWinningDetail.name} className="max-h-full max-w-full object-contain" />
              )}
              <div className="absolute bottom-4 left-4 bg-app-badge-bg px-2 py-1 rounded border border-app-border text-xs font-semibold text-app-text">
                {selectedWinningDetail.brand}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-app-text leading-tight mb-2">{selectedWinningDetail.name}</h3>
              <p className="text-sm text-app-muted mb-4">{selectedWinningDetail.specs}</p>

              <div className="bg-app-bg border border-app-border rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-app-muted uppercase tracking-wider font-semibold">Puja Ganadora</span>
                  <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">LIDERANDO</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-green-500 font-mono">DOP {selectedWinningDetail.price.toLocaleString()}</span>
                  <span className="text-xs text-app-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedWinningDetail.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-app-accent/5 rounded-lg border border-app-accent/10">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-app-muted">Ganador Actual</p>
                  <p className="text-sm font-bold text-app-text">{selectedWinningDetail.winnerName}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-app-border bg-app-bg/50 flex justify-end">
              <button
                onClick={() => setSelectedWinningDetail(null)}
                className="px-4 py-2 bg-app-accent hover:bg-app-accentHover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
