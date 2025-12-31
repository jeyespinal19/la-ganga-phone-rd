import React, { useState, useEffect, useRef } from 'react';
import { AuctionItem, BidHistoryItem } from '../types';
import { auctionService } from '../services/auctionService';
import { ArrowLeft, Clock, Shield, Truck, Zap, Share2, Gavel, User, Maximize2, X, Plus, Minus } from 'lucide-react';

interface ProductDetailProps {
  item: AuctionItem;
  onBack: () => void;
  onPlaceBid: (item: AuctionItem, amount?: number) => void;
  onShare: (item: AuctionItem) => void;
}

// Reuse timer logic
const parseTimeLeft = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleanStr = timeStr.replace('restantes', '').trim();
  let totalSeconds = 0;
  const daysMatch = cleanStr.match(/(\d+)\s*d/);
  if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 86400;
  const hoursMatch = cleanStr.match(/(\d+)\s*h/);
  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
  const minutesMatch = cleanStr.match(/(\d+)\s*m/);
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
  if (totalSeconds === 0 && cleanStr.includes('m') && !minutesMatch) {
    const m = parseInt(cleanStr);
    if (!isNaN(m)) totalSeconds = m * 60;
  }
  return totalSeconds;
};

const formatTimeLeft = (seconds: number): string => {
  if (seconds <= 0) return 'Finalizado';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ item, onBack, onPlaceBid, onShare }) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => parseTimeLeft(item.timeLeft));
  const [highlight, setHighlight] = useState(false);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [showLightbox, setShowLightbox] = useState(false);
  const [customBid, setCustomBid] = useState(item.currentBid + 50);
  const prevBidRef = useRef(item.currentBid);

  // Fetch history using AuctionService (Supabase)
  useEffect(() => {
    const fetchHistory = async () => {
      const history = await auctionService.getBidHistory(item.id);
      setBidHistory(history);
    };
    fetchHistory();
  }, [item.id, item.currentBid]); // Refetch when bid changes

  // Sync custom bid when current bid updates
  useEffect(() => {
    if (customBid <= item.currentBid) {
      setCustomBid(item.currentBid + 50);
    }
  }, [item.currentBid, customBid]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash effect on new bid
  useEffect(() => {
    if (item.currentBid > prevBidRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
    prevBidRef.current = item.currentBid;
  }, [item.currentBid]);

  const hasEnded = timeLeftSeconds <= 0;
  const isEndingSoon = timeLeftSeconds > 0 && timeLeftSeconds < 3600;

  const isCustomImage = item.imageDetails.startsWith('data:') || item.imageDetails.startsWith('http');
  const imageUrl = isCustomImage ? item.imageDetails : `https://picsum.photos/seed/${item.imageDetails}/800/800`;

  const renderBidHistory = () => (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-3">
          <div className="w-2 h-2 bg-app-neon-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,229,255,1)]" />
          Historial de Pujas
        </h3>
        <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg text-xs font-black text-app-neon-cyan">{bidHistory.length}</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 border-b border-white/10 sticky top-0 backdrop-blur-md z-10">
            <tr>
              <th className="p-4 font-black text-white/40 uppercase tracking-widest text-[10px]">Usuario</th>
              <th className="p-4 font-black text-white/40 uppercase tracking-widest text-[10px] text-right">Monto</th>
              <th className="p-4 font-black text-white/40 uppercase tracking-widest text-[10px] text-right">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bidHistory.map((bid, i) => (
              <tr key={i} className={i === 0 ? "bg-app-neon-cyan/5" : "hover:bg-white/5 transition-colors"}>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-black tracking-tight ${bid.userName === 'Tú' ? 'text-app-neon-cyan' : 'text-white'}`}>
                      {bid.userName}
                    </span>
                    {i === 0 && <span className="text-[10px] font-black uppercase text-app-neon-cyan tracking-[0.2em]">Liderando</span>}
                  </div>
                </td>
                <td className="p-4 text-right font-black text-white text-base">
                  DOP {bid.amount.toLocaleString()}
                </td>
                <td className="p-4 text-right text-[10px] font-bold text-white/30 uppercase">
                  {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
              </tr>
            ))}
            {bidHistory.length === 0 && (
              <tr>
                <td colSpan={3} className="p-12 text-center">
                  <Gavel className="w-12 h-12 mx-auto mb-4 text-white/10" />
                  <p className="font-bold text-white/20 uppercase tracking-widest text-xs">Sin pujas aún</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-700">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-app-neon-cyan/20 rounded-2xl transition-all group border border-white/10 hover:border-app-neon-cyan/50"
        >
          <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-1">Volver al catálogo</span>
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-black text-white tracking-widest uppercase">{item.brand}</h4>
            <div className="h-1 w-1 bg-app-neon-magenta rounded-full" />
            <span className="text-xs font-bold text-white/40 opacity-50">Ref: #{item.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* Left Column: Image AND History */}
        <div className="flex flex-col gap-6">
          {/* Image Card */}
          <div
            className="relative group cursor-zoom-in"
            onClick={() => setShowLightbox(true)}
          >
            <div className="bg-app-card border border-app-border rounded-2xl p-8 h-[400px] lg:h-[500px] flex items-center justify-center relative overflow-hidden">
              {/* Live Badge */}
              {!hasEnded && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-white shadow-lg z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-white"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase">En vivo</span>
                </div>
              )}

              {/* Zoom Hint */}
              <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                <Maximize2 className="w-5 h-5" />
              </div>

              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-contain mix-blend-normal transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Bid History Table (Desktop Only) */}
          <div className="hidden lg:block">
            {renderBidHistory()}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-app-accent/10 text-app-accent border border-app-accent/20 px-2 py-0.5 rounded text-xs font-semibold">
                {item.brand}
              </span>
              <span className="text-app-muted text-sm">Ref: #{item.id.substring(0, 6)}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-app-text mb-2">{item.name}</h1>
            <p className="text-app-muted text-lg">{item.specs || 'Especificaciones estándar del fabricante'}</p>
          </div>

          {/* Price Card */}
          <div className={`bg-app-card border rounded-2xl p-6 mb-6 transition-colors duration-300 ${highlight ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-app-border'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-app-muted mb-1">Puja actual</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold transition-all duration-300 ${highlight ? 'text-green-500 scale-105 origin-left' : 'text-app-text'}`}>
                    DOP {item.currentBid.toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-app-muted mb-1">Tiempo restante</p>
                <div className={`flex items-center justify-end gap-2 text-xl font-mono font-medium ${isEndingSoon ? 'text-red-500 animate-pulse' : 'text-app-text'}`}>
                  <Clock className="w-5 h-5" />
                  {formatTimeLeft(timeLeftSeconds)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Manual Bid Input */}
              {!hasEnded && (
                <div className="bg-app-bg border border-app-border rounded-xl p-1 flex items-center justify-between">
                  <button
                    onClick={() => setCustomBid(prev => Math.max(item.currentBid + 50, prev - 50))}
                    className="p-3 hover:bg-app-border rounded-lg text-app-muted hover:text-app-text transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-app-muted font-bold uppercase tracking-wider mb-0.5">Tu Puja</span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-app-muted">DOP</span>
                      <input
                        type="number"
                        value={customBid}
                        onChange={(e) => setCustomBid(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-28 bg-transparent text-center font-bold text-xl text-app-text focus:outline-none border-b border-transparent focus:border-app-accent transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setCustomBid(prev => prev + 50)}
                    className="p-3 hover:bg-app-border rounded-lg text-app-muted hover:text-app-text transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => onPlaceBid(item, customBid)}
                disabled={hasEnded}
                className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2
                            ${hasEnded
                    ? 'bg-app-muted/20 text-app-muted cursor-not-allowed'
                    : 'bg-app-accent hover:bg-app-accentHover active:scale-[0.98] text-white shadow-app-accent/25'
                  }`}
              >
                <Zap className="w-5 h-5 fill-current" />
                {hasEnded ? 'Subasta Finalizada' : 'Pujar Ahora'}
              </button>
              <button
                onClick={() => onShare(item)}
                className="w-full py-3 rounded-xl border border-app-border text-app-text font-medium hover:bg-app-bg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir Producto
              </button>
            </div>
          </div>

          {/* Info Tabs / Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-app-bg p-4 rounded-xl border border-app-border flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-app-text text-sm">Garantía Segura</h4>
                <p className="text-xs text-app-muted mt-1">Protección al comprador de 30 días incluida.</p>
              </div>
            </div>
            <div className="bg-app-bg p-4 rounded-xl border border-app-border flex items-start gap-3">
              <Truck className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-app-text text-sm">Envío Rápido</h4>
                <p className="text-xs text-app-muted mt-1">Entrega estimada en 3-5 días hábiles.</p>
              </div>
            </div>
          </div>

          {/* Bid History Table (Mobile Only) - Shown after info tabs */}
          <div className="block lg:hidden mb-8">
            {renderBidHistory()}
          </div>

          {/* Description Section (Static) */}
          <div className="mt-4 border-t border-app-border pt-6">
            <h3 className="text-lg font-bold text-app-text mb-4">Descripción del Producto</h3>
            <div className="space-y-4 text-app-muted text-sm leading-relaxed">
              <p>
                Este {item.name} de {item.brand} ofrece un rendimiento excepcional con su configuración de {item.specs}.
                Diseñado para usuarios exigentes, cuenta con tecnología de punta y un diseño robusto característico de la marca.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pantalla de alta resolución con colores vibrantes.</li>
                <li>Batería de larga duración para todo el día.</li>
                <li>Sistema de cámaras avanzado para fotos nítidas.</li>
                <li>Conectividad 5G ultrarrápida (según modelo).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={item.name}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};