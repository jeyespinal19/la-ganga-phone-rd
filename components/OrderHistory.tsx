import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { formatCurrency } from '../utils/format';
import { productService } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface OrderHistoryProps {
    onBack: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await productService.getOrders(user.id);
                const typedOrders: Order[] = data.map((order: any) => ({
                    ...order,
                    items: order.order_items || []
                }));
                setOrders(typedOrders);
            } catch (e) {
                console.error('Error fetching orders:', e);
                setError('Error al cargar los pedidos');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Cargando tus pedidos...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fbff] pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-xl px-6 py-6 flex items-center gap-4 sticky top-0 z-10 border-b border-white shadow-sm">
                <button onClick={onBack} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:scale-110 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mis Pedidos</h2>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Historial de Compras</p>
                </div>
            </div>

            <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
                {error && (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 flex items-center gap-4 border border-red-100 animate-shake">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">⚠️</div>
                        <p className="font-bold text-sm uppercase tracking-wider">{error}</p>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-blue-500/5">
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-100">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Aún no tienes pedidos</h3>
                        <p className="text-gray-400 font-medium mb-8 uppercase tracking-widest text-[10px]">Tus compras aparecerán aquí</p>
                        <button
                            onClick={onBack}
                            className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 active:scale-95 transition-all text-xs uppercase tracking-widest hover:bg-blue-700"
                        >
                            Empezar a Comprar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">
                                <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID PEDIDO</p>
                                        <p className="font-black text-gray-900 tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${order.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' :
                                        order.status === 'delivered' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                        {order.status === 'paid' ? 'Pagado' :
                                            order.status === 'delivered' ? 'Entregado' :
                                                order.status === 'cancelled' ? 'Cancelado' :
                                                    order.status === 'shipped' ? 'En camino' : 'Pendiente'}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white shadow-sm group-hover:bg-white/60 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 border border-blue-50 text-xs shadow-sm">
                                                    {item.quantity}x
                                                </div>
                                                <span className="text-gray-900 font-black text-xs uppercase tracking-tighter">Producto Ref: {item.product_id.slice(0, 8)}</span>
                                            </div>
                                            <span className="font-black text-gray-900 text-sm">RD$ {item.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-blue-600/5 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                                            <span className="text-xs">📅</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Fecha</p>
                                            <p className="text-xs font-black text-gray-900 italic">
                                                {new Date(order.created_at).toLocaleDateString('es-DO', {
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 leading-none">Total Pagado</p>
                                        <p className="text-2xl font-black text-gray-900 tracking-tighter">RD$ {order.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
