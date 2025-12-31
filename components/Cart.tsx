
import React from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
    cartItems: CartItem[];
    onUpdateQuantity: (id: string, newQuantity: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
    onBack: () => void;
}

export const Cart: React.FC<CartProps> = ({
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onBack
}) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total > 2000 ? 0 : 250;
    const finalTotal = total + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Parece que aún no has agregado nada. ¡Explora nuestras ofertas!</p>
                <button
                    onClick={onBack}
                    className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                >
                    Explorar Productos
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-right-8 fade-in duration-500 pb-32">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-black">
                    ← Seguir Comprando
                </button>
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-6">Tu Carrito ({cartItems.length})</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => {
                        const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
                        const imageUrl = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/200/200`;

                        return (
                            <div key={item.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex gap-4 shadow-sm">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm md:text-base">{item.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="p-1 hover:text-black text-gray-400"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-black text-gray-600"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="font-bold text-gray-900">RD$ {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:w-96">
                    <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 sticky top-4">
                        <h2 className="text-lg font-black text-gray-900 mb-6">Resumen del Pedido</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-900">RD$ {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Envío</span>
                                {shipping === 0 ? (
                                    <span className="font-bold text-green-600">Gratis</span>
                                ) : (
                                    <span className="font-bold text-gray-900">RD$ {shipping.toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-8">
                            <span className="text-base font-black text-gray-900">Total</span>
                            <span className="text-xl font-black text-gray-900">RD$ {finalTotal.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={onCheckout}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 group"
                        >
                            <span>Ir a Pagar</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-4">Transacciones seguras y encriptadas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
