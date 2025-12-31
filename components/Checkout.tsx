
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { MapPin, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

interface CheckoutProps {
    cartItems: any[];
    total: number;
    onSuccess: () => void;
    onBack: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, total, onSuccess, onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [shipping, setShipping] = useState({
        name: user?.user_metadata?.name || '',
        address: '',
        city: '',
        phone: '',
        notes: ''
    });

    const handleCreateOrder = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            await productService.createOrder(
                user.id,
                total,
                shipping,
                cartItems
            );
            setStep('confirm');
            // Wait a bit to show success screen then trigger parent success (clear cart)
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (err) {
            console.error(err);
            setError('Error al procesar el pedido. Intenta nuevamente.');
            setLoading(false);
        }
    };

    if (step === 'confirm') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">¡Pedido Confirmado!</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Gracias por tu compra. Te hemos enviado un correo con los detalles.
                </p>
                <div className="text-sm text-gray-400">Redirigiendo...</div>
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-right-8 fade-in duration-500 max-w-2xl mx-auto pb-20">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Volver al Carrito
            </button>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-10 px-4">
                <div className={`flex flex-col items-center gap-2 ${step === 'shipping' ? 'text-black' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 'shipping' ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Envío</span>
                </div>
                <div className="h-[2px] flex-1 bg-gray-100 mx-4" />
                <div className={`flex flex-col items-center gap-2 ${step === 'payment' ? 'text-black' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Pago</span>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                {step === 'shipping' && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-4">
                        <h2 className="text-xl font-black mb-6">Detalles de Envío</h2>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                            <input
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                                value={shipping.name}
                                onChange={e => setShipping({ ...shipping, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                                    value={shipping.phone}
                                    onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ciudad</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                                    value={shipping.city}
                                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección / Calle</label>
                            <textarea
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none resize-none h-24"
                                value={shipping.address}
                                onChange={e => setShipping({ ...shipping, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas Adicionales (Opcional)</label>
                            <input
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-black/5 outline-none"
                                value={shipping.notes}
                                onChange={e => setShipping({ ...shipping, notes: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors">
                            Siguiente: Pago
                        </button>
                    </form>
                )}

                {step === 'payment' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-black">Método de Pago</h2>

                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full text-orange-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Pago Contra Entrega</h3>
                                <p className="text-sm text-gray-600">Pagas en efectivo o transferencia al recibir tu pedido.</p>
                            </div>
                            <div className="ml-auto">
                                <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary in Checkout */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total a Pagar</span>
                                <span className="font-black text-lg">RD$ {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2">
                                <span>{cartItems.length} artículos</span>
                                <span>Envío incluido</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreateOrder}
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Pedido'}
                        </button>

                        <button onClick={() => setStep('shipping')} className="w-full text-gray-500 text-sm font-bold py-2">
                            Atrás
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
