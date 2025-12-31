
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
      className={`glass rounded-xl overflow-hidden border flex flex-col transition-all duration-300 group relative cursor-pointer
      ${hasEnded
          ? 'border-red-900/30 opacity-75'
          : isWinning
            ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-[1.02] z-20 ring-1 ring-yellow-500'
            : highlight
              ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-[1.02] z-10 ring-1 ring-green-500'
              : 'border-app-border hover:border-app-accent/50 hover:shadow-lg'
        }`}
    >
      {/* Winning Indicator Background Pulse */}
      {isWinning && !hasEnded && (
        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none z-0"></div>
      )}

      {/* Image Container */}
      <div className="relative h-32 sm:h-48 w-full bg-app-image-bg overflow-hidden p-3 sm:p-4 flex items-center justify-center transition-colors">

        {/* Live Indicator (Top Left) */}
        {!hasEnded && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5 bg-red-600 px-1.5 py-0.5 sm:px-2 rounded text-white shadow-sm z-10">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-white"></span>
            </span>
            <span className="text-[8px] sm:text-[10px] font-extrabold tracking-wide uppercase">En vivo</span>
          </div>
        )}

        {/* Winning Badge (Top Right) */}
        {isWinning && !hasEnded && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 bg-yellow-500 text-black px-2 py-1 rounded shadow-lg z-10 animate-in fade-in zoom-in duration-300">
            <Trophy className="w-3 h-3 fill-black" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ganando</span>
          </div>
        )}

        {!imageLoaded && (
          <div className="absolute inset-0 bg-app-bg animate-pulse"></div>
        )}

        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full object-contain mix-blend-normal transition-all duration-500 relative z-0 ${!hasEnded && 'group-hover:scale-105'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-2 gap-1">
          <div className="min-w-0">
            <h3 className="text-app-text font-bold text-xs sm:text-sm leading-tight mb-0.5 truncate pr-1 neon-underline">
              {item.name}
            </h3>
            {item.specs && (
              <p className="text-app-muted text-[10px] sm:text-xs leading-tight truncate">
                {item.specs}
              </p>
            )}
          </div>
          <span className="bg-app-badge-bg text-[10px] sm:text-xs text-app-muted px-1.5 py-0.5 rounded border border-app-border whitespace-nowrap">
            {item.brand}
          </span>
        </div>

        <div className="flex flex-col mb-3 sm:mb-4 mt-auto">
          <div className="flex justify-between items-end text-[10px] sm:text-xs text-app-muted mb-1">
            <span>Puja actual</span>
            <span>Termina en</span>
          </div>
          <div className="flex justify-between items-end">
            <span className={`font-bold transition-all duration-300 text-base sm:text-xl ${isWinning ? 'text-yellow-500' : highlight ? 'text-green-500 scale-105' : 'text-app-accent'}`}>
              {formattedPrice}
            </span>
            <span className={`text-[10px] sm:text-xs font-medium flex items-center gap-1 ${isEndingSoon ? 'text-red-500' : 'text-app-muted'} ${hasEnded ? 'text-red-500' : ''}`}>
              <Clock className={`w-3 h-3 ${isEndingSoon ? 'animate-pulse' : ''}`} />
              <span
                key={timeLeftSeconds}
                className={`${!hasEnded ? 'animate-in fade-in zoom-in-95 duration-300' : ''}`}
              >
                {timeDisplay}
              </span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Pass undefined for amount to trigger default increment logic
              onPlaceBid(item);
            }}
            disabled={hasEnded}
            className={`flex-1 text-xs sm:text-sm font-semibold py-1.5 sm:py-2 rounded transition-all flex items-center justify-center
                  ${hasEnded
                ? 'bg-app-muted/20 text-app-muted cursor-not-allowed'
                : isWinning
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                  : 'bg-app-accent hover:bg-app-accentHover active:scale-95 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]'
              }`}
          >
            <Zap className="w-4 h-4 mr-1 fill-current" />
            {hasEnded ? 'Fin' : isWinning ? '¡Vas Ganando!' : 'Pujar'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(item);
            }}
            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded border transition-colors flex items-center justify-center bg-app-badge-bg hover:bg-app-border border-app-border text-app-muted hover:text-app-text"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProductCard = React.memo(ProductCardComponent);
