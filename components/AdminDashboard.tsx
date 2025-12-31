
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
  Upload
} from 'lucide-react';
import { Product, User } from '../types';

interface AdminDashboardProps {
  items: Product[];
  users: User[];
  onAddItem: (newItem: Omit<Product, 'id'>) => void;
  onEditItem: (id: string, updatedFields: Partial<Product>) => void;
  onDeleteItem: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onBack: () => void;
}

type Tab = 'overview' | 'products' | 'users';

const ROW_HEIGHT = 80;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  users,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDeleteUser,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('products'); // Default to products
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    brand: 'Samsung',
    specs: '',
    price: '',
    originalPrice: '',
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
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
            <p className="text-sm text-gray-500">{items.length} productos</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-20">Imagen</th>
                <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Producto</th>
                <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Precio</th>
                <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                const imgSrc = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/100/100`;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={imgSrc} className="w-full h-full object-cover" alt="mini" />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-gray-900">RD$ {item.price.toLocaleString()}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
    )
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-gray-50 p-6">

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shrink-0 h-fit">
        <div className="mb-8">
          <h1 className="text-xl font-black italic tracking-tighter">
            <span className="text-orange-500">Panel</span>
            <span className="text-blue-600 ml-1">Admin</span>
          </h1>
        </div>

        <nav className="space-y-1">
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'products' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Package className="w-5 h-5" /> Productos
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5" /> Usuarios
          </button>
        </nav>

        <button onClick={onBack} className="mt-8 text-sm text-gray-500 font-bold hover:text-black">
          ← Volver a la Tienda
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {activeTab === 'products' ? renderProducts() : (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Gestión de usuarios próximamente</p>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                  value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marca</label>
                  <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                    value={newItem.brand} onChange={e => setNewItem({ ...newItem, brand: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio (RD$)</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                    value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none h-24 resize-none"
                  value={newItem.specs} onChange={e => setNewItem({ ...newItem, specs: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-4 hover:bg-gray-100 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 font-bold">Subir Imagen</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors">
                  {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
