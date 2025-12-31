
import React, { useEffect, useRef, useState } from 'react';
import { Zap, Clock, Share2, Trophy } from 'lucide-react';
import { AuctionItem } from '../types';

interface ProductCardProps {
  item: AuctionItem;
  isWinning?: boolean;
  onPlaceBid: (item: AuctionItem, amount?: number) => void;
  onShare: (item: AuctionItem) => void;
  onClick?: (item: AuctionItem) => void;
}

// Helper to parse "12d 3h remaining" into seconds
const parseTimeLeft = (timeStr: string): number => {
  const cleanStr = timeStr.replace('restantes', '').trim();
  let totalSeconds = 0;

  const daysMatch = cleanStr.match(/(\d+)\s*d/);
  if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 86400;

  const hoursMatch = cleanStr.match(/(\d+)\s*h/);
  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;

  const minutesMatch = cleanStr.match(/(\d+)\s*m/);
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;

  // If the string was just minutes like "23m"
  if (totalSeconds === 0 && cleanStr.includes('m') && !minutesMatch) {
    const m = parseInt(cleanStr);
    if (!isNaN(m)) totalSeconds = m * 60;
  }

  return totalSeconds;
};

// Helper to format seconds back to string
const formatTimeLeft = (seconds: number): string => {
  if (seconds <= 0) return 'Finalizado';

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

const ProductCardComponent: React.FC<ProductCardProps> = ({ item, isWinning = false, onPlaceBid, onShare, onClick }) => {
  // Format price like "DOP 20.000"
  const formattedPrice = `DOP ${item.currentBid.toLocaleString('es-ES')}`;

  // State for the flash effect
  const [highlight, setHighlight] = useState(false);
  const prevBidRef = useRef(item.currentBid);

  // Timer state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => parseTimeLeft(item.timeLeft));

  // Image loading state
  const [imageLoaded, setImageLoaded] = useState(false);

  // Trigger flash when price increases
  useEffect(() => {
    if (item.currentBid > prevBidRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000); // 2 second flash
      return () => clearTimeout(timer);
    }
    prevBidRef.current = item.currentBid;
  }, [item.currentBid]);

  // Countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeDisplay = formatTimeLeft(timeLeftSeconds);
  const isEndingSoon = timeLeftSeconds > 0 && timeLeftSeconds < 3600; // Less than 1 hour
  const hasEnded = timeLeftSeconds <= 0;

  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
  const imageUrl = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/400/300`;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="bg-white border-none flex flex-col group relative cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden flex items-center justify-center">
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

        {/* Ad Badge */}
        <div className="absolute bottom-0 right-0 bg-black/40 text-[9px] text-white px-1 py-0.5">
          Anuncio
        </div>

        {/* Live Ribbon */}
        {!hasEnded && (
          <div className="absolute top-2 left-0 bg-green-600 px-2 py-0.5 rounded-r-md flex items-center gap-1 shadow-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Envío gratis</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-2 pb-4 flex flex-col">
        {/* Hot Badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
            #1 ARTÍCULO MÁS VENDIDO...
          </span>
        </div>

        <h3 className="text-gray-800 font-medium text-xs leading-tight mb-2 line-clamp-2">
          {item.name} {item.specs}
        </h3>

        {/* Dynamic Badge (Social Proof) */}
        {!hasEnded && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">ÚLTIMAS 3 A PRECIO PROMOCIONAL</span>
          </div>
        )}

        {/* Rating & Sales */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-gray-800" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">1,252</span>
        </div>

        {/* Price & Cart Style Bid */}
        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-gray-900">RD$</span>
              <span className="text-base font-black text-gray-900 tracking-tight">
                {item.currentBid.toLocaleString('es-ES')}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {(Math.random() * 100).toFixed(0)}K+ventas
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlaceBid(item);
            }}
            className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17h-11v-14h-2" />
              <path d="M6 5l14 1l-1 7h-13" />
            </svg>
          </button>
        </div>

        {/* Footer Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" />
            <span>Vendedor estrella</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProductCard = React.memo(ProductCardComponent);
