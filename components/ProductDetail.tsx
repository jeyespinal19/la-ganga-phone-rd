
import React, { useState } from 'react';
import { Product } from '../types';
import { ArrowLeft, Shield, Truck, Share2, Star, Check, ShoppingCart, Minus, Plus } from 'lucide-react';

interface ProductDetailProps {
  item: Product;
  onBack: () => void;
  onAddToCart: (item: Product, quantity: number) => void;
  onShare: (item: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ item, onBack, onAddToCart, onShare }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');

  // Use random seed or direct URL
  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
  const imageUrl = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/800/800`;

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
  };

  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-500 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-sm font-medium text-gray-500">Volver</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center p-8">
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          {/* Header Info */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600 uppercase">{item.brand}</span>
              <div className="flex items-center text-yellow-500 text-xs gap-1">
                <Star className="w-3 h-3 fill-yellow-500" />
                <span className="text-gray-900 font-bold">4.8</span>
                <span className="text-gray-400">(150 reviews)</span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black text-gray-900 tracking-tight">RD$ {item.price.toLocaleString('es-ES')}</span>
              {item.originalPrice && (
                <span className="text-lg text-gray-400 line-through mb-1">RD$ {item.originalPrice.toLocaleString('es-ES')}</span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col gap-4 mb-8 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">Cantidad</span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-black text-gray-400">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-black text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </button>
                <button
                  onClick={() => onShare(item)}
                  className="p-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Envío Gratis</h4>
                  <p className="text-xs text-gray-500">En pedidos mayores a RD$ 2,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Garantía Asegurada</h4>
                  <p className="text-xs text-gray-500">30 días de devolución</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-lg mb-3">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.specs}
                <br /><br />
                Este dispositivo {item.brand} cuenta con la mejor tecnología del mercado.
                Ideal para uso profesional y personal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};