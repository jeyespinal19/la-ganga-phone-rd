
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  item: Product;
  onAddToCart: (item: Product) => void;
  onShare: (item: Product) => void;
  onClick?: (item: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ item, onAddToCart, onShare, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use random seed or direct URL
  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
  const imageUrl = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/400/300`;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="shop-card flex flex-col group relative cursor-pointer p-3"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden flex items-center justify-center rounded-xl mb-3">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
        )}
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Discount Badge if Original Price exists */}
        {item.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {item.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">AGOTADO</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        {/* Brand / Sales */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">{item.brand}</span>
        </div>

        <h3 className="text-gray-900 font-medium text-xs leading-tight line-clamp-2 min-h-[2.5em]">
          {item.name} {item.specs}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-yellow-400" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({(Math.random() * 500).toFixed(0)})</span>
        </div>

        {/* Price & Cart */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-orange-600">RD$</span>
              <span className="text-lg font-black text-gray-900 tracking-tight">
                {item.price.toLocaleString('es-ES')}
              </span>
            </div>
            {item.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                RD$ {item.originalPrice.toLocaleString('es-ES')}
              </span>
            )}
          </div>

          <button
            disabled={item.stock <= 0}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${item.stock > 0 ? 'bg-black text-white hover:bg-gray-800 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Shadow on Hover Effect (handled via CSS class shop-card) */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 group-hover:ring-app-accent/20 pointer-events-none" />
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
