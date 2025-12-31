import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface OrderHistoryProps {
    onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
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
        <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={onBack} className="p-1 -ml-1">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Mis Pedidos</h2>
            </div>

            <div className="flex-1 px-4 py-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-blue-600">📦</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes pedidos</h3>
                        <p className="text-gray-500 mb-6">Tus pedidos aparecerán aquí una vez que realices una compra.</p>
                        <button
                            onClick={onBack}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                        >
                            Ir a comprar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">ID PEDIDO</p>
                                        <p className="font-mono text-sm text-gray-700">#{order.id.slice(0, 8)}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            order.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.status === 'paid' ? 'Pagado' :
                                            order.status === 'delivered' ? 'Entregado' :
                                                order.status === 'cancelled' ? 'Cancelado' :
                                                    order.status === 'shipped' ? 'En camino' : 'Pendiente'}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/50">
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-white border border-gray-200 w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-gray-700 font-medium">Producto ID: {item.product_id.slice(0, 8)}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 flex justify-between items-center bg-white">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Fecha</p>
                                        <p className="text-sm font-medium text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('es-DO', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-0.5">Total pagado</p>
                                        <p className="text-lg font-black text-blue-600">{formatCurrency(order.total)}</p>
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
