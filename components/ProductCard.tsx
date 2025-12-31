
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
      className={`glass rounded-2xl overflow-hidden border flex flex-col transition-all duration-500 group relative cursor-pointer
      ${hasEnded
          ? 'border-white/5 opacity-60 grayscale-[0.5]'
          : isWinning
            ? 'border-app-neon-magenta shadow-[0_0_30px_rgba(255,0,255,0.2)] scale-[1.03] z-20 ring-1 ring-app-neon-magenta/50'
            : highlight
              ? 'border-app-neon-cyan shadow-[0_0_30px_rgba(0,229,255,0.2)] scale-[1.03] z-10 ring-1 ring-app-neon-cyan/50'
              : 'border-white/10 hover:border-app-neon-cyan/50 hover:shadow-[0_0_40px_rgba(0,229,255,0.1)] hover:-translate-y-1'
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
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-black text-sm sm:text-base leading-tight mb-1 truncate group-hover:text-app-neon-cyan transition-colors">
              {item.name}
            </h3>
            {item.specs && (
              <p className="text-app-muted text-[10px] sm:text-xs leading-tight line-clamp-1 italic font-medium">
                {item.specs}
              </p>
            )}
          </div>
          <span className="bg-white/5 text-[9px] sm:text-[10px] font-black text-app-neon-cyan px-2 py-0.5 rounded border border-app-neon-cyan/20 uppercase tracking-tighter shadow-[0_0_8px_rgba(0,229,255,0.1)]">
            {item.brand}
          </span>
        </div>

        <div className="flex flex-col mb-4 sm:mb-5 mt-auto">
          <div className="flex justify-between items-end text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-app-muted/60 mb-1.5">
            <span>Puja actual</span>
            <span>Finaliza</span>
          </div>
          <div className="flex justify-between items-end">
            <span className={`font-black tracking-tighter transition-all duration-500 text-lg sm:text-2xl ${isWinning ? 'text-app-neon-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.4)]' : highlight ? 'text-app-neon-cyan scale-105 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]' : 'text-white'}`}>
              {formattedPrice}
            </span>
            <div className={`text-[10px] sm:text-xs font-black flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/5 ${isEndingSoon ? 'text-app-neon-magenta animate-pulse border-app-neon-magenta/30' : 'text-app-neon-cyan border-app-neon-cyan/30'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span
                key={timeLeftSeconds}
                className="font-mono"
              >
                {timeDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlaceBid(item);
            }}
            disabled={hasEnded}
            className={`flex-[2] relative overflow-hidden group/btn rounded-xl transition-transform active:scale-95
                  ${hasEnded
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : isWinning
                  ? 'bg-app-neon-magenta shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,255,0.6)]'
                  : 'bg-app-neon-cyan shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]'
              }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300
              ${isWinning ? 'from-magenta-600 to-app-neon-magenta' : 'from-cyan-600 to-app-neon-cyan'}
            `}></div>
            <div className="relative py-2.5 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-white drop-shadow-sm">
              <Zap className={`w-3.5 h-3.5 fill-current ${!hasEnded && 'animate-pulse'}`} />
              {hasEnded ? 'Subasta Cerrada' : isWinning ? '¡Vas Ganando!' : 'Lanzar Puja'}
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(item);
            }}
            className="flex-1 glass border border-white/10 hover:border-app-neon-cyan/50 hover:bg-app-neon-cyan/10 text-white flex items-center justify-center rounded-xl transition-all"
            title="Compartir"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProductCard = React.memo(ProductCardComponent);
