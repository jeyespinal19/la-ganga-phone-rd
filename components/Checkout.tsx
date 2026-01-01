import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { MapPin, CreditCard, CheckCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// TODO: Replace with your Stripe Publishable Key from Dashboard
const stripePromise = loadStripe('pk_test_placeholder_key');

interface CheckoutProps {
    cartItems: any[];
    total: number;
    onSuccess: () => void;
    onBack: () => void;
}

const CheckoutForm: React.FC<{
    total: number;
    shipping: any;
    cartItems: any[];
    onSuccess: () => void;
    onBackToShipping: () => void;
    paymentMethod: 'stripe' | 'cod';
}> = ({ total, shipping, cartItems, onSuccess, onBackToShipping, paymentMethod }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create the Order in Supabase
            const orderId = await productService.createOrder(
                user.id,
                total,
                shipping,
                cartItems
            );

            if (paymentMethod === 'stripe') {
                if (!stripe || !elements) return;

                // 2. Create PaymentIntent via Edge Function
                const { clientSecret } = await productService.createPaymentIntent(orderId, total * 100); // Stripe expects cents

                // 3. Confirm Payment
                const { error: stripeError } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: window.location.origin + '?order_success=true',
                        payment_method_data: {
                            billing_details: {
                                name: shipping.name,
                                email: user.email,
                                address: {
                                    line1: shipping.address,
                                    city: shipping.city,
                                }
                            }
                        }
                    },
                    redirect: 'if_required'
                });

                if (stripeError) {
                    setError(stripeError.message || 'Error en el pago');
                    setLoading(false);
                } else {
                    onSuccess();
                }
            } else {
                // Cash on Delivery
                onSuccess();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al procesar el pedido');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black mb-6">Detalles de Pago</h2>

            {paymentMethod === 'stripe' ? (
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <PaymentElement />
                </div>
            ) : (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full text-orange-600">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Pago Contra Entrega</h3>
                        <p className="text-sm text-gray-600">Pagas en efectivo o transferencia al recibir tu pedido.</p>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm border border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Total a Pagar</span>
                    <span className="font-black text-xl text-blue-600">RD$ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2 font-medium">
                    <span>{cartItems.length} artículos</span>
                    <span>Envío incluido</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 animate-shake">
                    <span>⚠️</span> {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || (paymentMethod === 'stripe' && !stripe)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 h-[60px]"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>PROCESANDO...</span>
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        <span>CONFIRMAR Y PAGAR</span>
                    </>
                )}
            </button>

            <button type="button" onClick={onBackToShipping} className="w-full text-gray-400 text-sm font-bold py-2 hover:text-gray-600 transition-colors">
                MODIFICAR ENVÍO
            </button>
        </form>
    );
};

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, total, onSuccess, onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'shipping' | 'choose_method' | 'payment' | 'confirm'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('cod');
    const [loading, setLoading] = useState(false);

    const [shipping, setShipping] = useState({
        name: user?.user_metadata?.name || '',
        address: '',
        city: '',
        phone: '',
        notes: '',
        id: ''
    });

    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Fetch saved addresses when entering shipping step
    useEffect(() => {
        if (step === 'shipping' && user) {
            setLoadingAddresses(true);
            productService
                .getAddresses(user.id)
                .then((data) => setAddresses(data))
                .catch((err) => console.error('Error fetching addresses', err))
                .finally(() => setLoadingAddresses(false));
        }
    }, [step, user]);



    // Save a new address to Supabase
    const handleSaveAddress = async () => {
        if (!user) return;
        try {
            const newAddr = await productService.addAddress({
                user_id: user.id,
                name: shipping.name,
                address: shipping.address,
                city: shipping.city,
                phone: shipping.phone,
                notes: shipping.notes,
                is_default: addresses.length === 0 // first address becomes default
            });
            // Update addresses list and set selected id
            setAddresses((prev) => [...prev, newAddr]);
            setShipping((prev) => ({ ...prev, id: newAddr.id }));
        } catch (e) {
            console.error('Error saving address', e);
        }
    };




    if (step === 'confirm') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-in zoom-in-95 duration-500 bg-white rounded-3xl border border-gray-100 shadow-xl m-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 relative">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                    <div className="absolute inset-0 rounded-full animate-ping bg-green-200 opacity-20" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">¡ÓRDEN RECIBIDA!</h2>
                <p className="text-gray-500 mb-10 max-w-sm text-lg leading-relaxed">
                    Hemos registrado tu pedido correctamente. Pronto nos pondremos en contacto contigo.
                </p>
                <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    VOLVIENDO A LA TIENDA...
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto pb-24 px-4 pt-4">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> CANCELAR Y VOLVER
            </button>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8 px-8">
                <StepIcon icon={<MapPin className="w-5 h-5" />} active={step === 'shipping'} label="Envío" />
                <div className="h-[2px] flex-1 bg-gray-100 mx-2 mb-6" />
                <StepIcon icon={<CreditCard className="w-5 h-5" />} active={step === 'choose_method' || step === 'payment'} label="Pago" />
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-blue-900/5">
                {step === 'shipping' && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep('choose_method'); }} className="space-y-5">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Detalles de Envío</h2>
                            <p className="text-gray-400 text-sm font-medium">¿A dónde enviamos tu compra hoy?</p>
                        </div>

                        {/* Direcciones guardadas */}
                        {loadingAddresses ? (
                            <p className="text-sm text-gray-500">Cargando direcciones...</p>
                        ) : (
                            addresses.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Dirección guardada</label>
                                    <select
                                        value={shipping.id || ''}
                                        onChange={e => {
                                            const addr = addresses.find(a => a.id === e.target.value);
                                            if (addr) {
                                                setShipping({
                                                    name: addr.name,
                                                    address: addr.address,
                                                    city: addr.city,
                                                    phone: addr.phone,
                                                    notes: addr.notes || '',
                                                    id: addr.id
                                                });
                                            }
                                        }}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4"
                                    >
                                        <option value="">Selecciona una dirección</option>
                                        {addresses.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} - {a.address}, {a.city}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShipping({ name: '', address: '', city: '', phone: '', notes: '', id: '' })}
                                        className="mt-2 text-sm text-blue-600 hover:underline"
                                    >
                                        Usar nueva dirección
                                    </button>
                                    {/* Guardar nueva dirección */}
                                    {shipping.id === '' && shipping.name && shipping.address && shipping.city && shipping.phone && (
                                        <button
                                            type="button"
                                            onClick={handleSaveAddress}
                                            className="mt-2 ml-4 text-sm text-green-600 hover:underline"
                                        >
                                            Guardar dirección
                                        </button>
                                    )}
                                </div>
                            )
                        )}

                        <FormInput label="Nombre Completo" value={shipping.name} onChange={v => setShipping({ ...shipping, name: v })} required />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput label="Teléfono" value={shipping.phone} onChange={v => setShipping({ ...shipping, phone: v })} required />
                            <FormInput label="Ciudad" value={shipping.city} onChange={v => setShipping({ ...shipping, city: v })} required />
                        </div>

                        <FormInput label="Dirección / Calle" isTextArea value={shipping.address} onChange={v => setShipping({ ...shipping, address: v })} required />
                        <FormInput label="Notas (Piso, Puerta, etc.)" value={shipping.notes} onChange={v => setShipping({ ...shipping, notes: v })} />

                        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4">
                            Siguiente: Método de Pago
                        </button>
                    </form>
                )}

                {step === 'choose_method' && (
                    <div className="space-y-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Elige el Pago</h2>
                            <p className="text-gray-400 text-sm font-medium">Selecciona tu método preferido</p>
                        </div>

                        <div className="space-y-4">
                            <PaymentOption
                                selected={paymentMethod === 'stripe'}
                                onClick={() => setPaymentMethod('stripe')}
                                icon={<Lock className="w-6 h-6" />}
                                title="Tarjeta de Crédito / Débito"
                                desc="Seguro vía Stripe"
                            />
                            <PaymentOption
                                selected={paymentMethod === 'cod'}
                                onClick={() => setPaymentMethod('cod')}
                                icon={<CreditCard className="w-6 h-6" />}
                                title="Pago Contra Entrega"
                                desc="Efectivo o transferencia al recibir"
                            />
                        </div>

                        <button
                            onClick={() => setStep('payment')}
                            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6"
                        >
                            Continuar con {paymentMethod === 'stripe' ? 'Tarjeta' : 'Efectivo'}
                        </button>

                        <button onClick={() => setStep('shipping')} className="w-full text-gray-400 text-sm font-bold py-2 hover:text-gray-600">
                            ATRÁS
                        </button>
                    </div>
                )}

                {step === 'payment' && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            total={total}
                            shipping={shipping}
                            cartItems={cartItems}
                            paymentMethod={paymentMethod}
                            onSuccess={() => {
                                setStep('confirm');
                                setTimeout(onSuccess, 4000);
                            }}
                            onBackToShipping={() => setStep('choose_method')}
                        />
                    </Elements>
                )}
            </div>
        </div>
    );
};

// UI Helpers
const StepIcon = ({ icon, active, label }: { icon: React.ReactNode, active: boolean, label: string }) => (
    <div className={`flex flex-col items-center gap-2 group`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
            {icon}
        </div>
        <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
    </div>
);

const FormInput = ({ label, value, onChange, required, isTextArea }: any) => (
    <div className="group">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-blue-500">{label}</label>
        {isTextArea ? (
            <textarea
                required={required}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none h-32"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        ) : (
            <input
                required={required}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all h-[60px]"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        )}
    </div>
);

const PaymentOption = ({ selected, onClick, icon, title, desc }: any) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${selected ? 'border-blue-600 bg-blue-50/20' : 'border-gray-100 items-center bg-gray-50/50 hover:bg-gray-100/50'}`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <h3 className={`font-black text-lg leading-tight ${selected ? 'text-blue-600' : 'text-gray-900'}`}>{title}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{desc}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-blue-600 bg-white' : 'border-gray-200 bg-white'}`}>
            {selected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
        </div>
    </button>
);
