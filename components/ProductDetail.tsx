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
            <div className="glass border border-white/10 rounded-[2.5rem] p-8 h-[500px] lg:h-[600px] flex items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-3xl">
              <div className="absolute inset-0 bg-app-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Live Badge */}
              {!hasEnded && (
                <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-app-neon-magenta/50 px-5 py-2 rounded-2xl text-white shadow-[0_0_20px_rgba(255,0,255,0.3)] z-10 scale-90 sm:scale-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-neon-magenta opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-app-neon-magenta"></span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">Subasta en Vivo</span>
                </div>
              )}

              {/* Zoom Hint */}
              <div className="absolute top-8 right-8 p-4 bg-app-neon-cyan/20 backdrop-blur-md rounded-2xl text-app-neon-cyan border border-app-neon-cyan/30 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none translate-x-4 group-hover:translate-x-0">
                <Maximize2 className="w-6 h-6" />
              </div>

              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-contain mix-blend-normal transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
              />
            </div>
          </div>

          {/* Bid History Table (Desktop Only) */}
          <div className="hidden lg:block">
            {renderBidHistory()}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col py-2">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-app-neon-cyan/10 text-app-neon-cyan border border-app-neon-cyan/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em]">
                {item.brand}
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">{item.name}</h1>
            <p className="text-white/40 text-lg font-bold italic opacity-60 uppercase tracking-widest">{item.specs || 'Edición Limitada Premium'}</p>
          </div>

          {/* Price Card */}
          <div className={`glass relative border rounded-[2rem] p-8 mb-8 transition-all duration-500 overflow-hidden ${highlight ? 'border-app-neon-cyan shadow-[0_0_50px_rgba(0,229,255,0.2)]' : 'border-white/10'}`}>
            {highlight && <div className="absolute inset-0 bg-app-neon-cyan/5 animate-pulse" />}

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Oferta Actual</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black transition-all duration-500 tracking-tighter ${highlight ? 'text-app-neon-cyan scale-105 origin-left' : 'text-white'}`}>
                    DOP {item.currentBid.toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Cierre de subasta</p>
                <div className={`flex items-center sm:justify-end gap-3 text-2xl font-black tracking-widest ${isEndingSoon ? 'text-app-neon-magenta animate-pulse' : 'text-app-neon-cyan'}`}>
                  <Clock className="w-6 h-6" />
                  {formatTimeLeft(timeLeftSeconds)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Manual Bid Input */}
              {!hasEnded && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-inner">
                  <button
                    onClick={() => setCustomBid(prev => Math.max(item.currentBid + 50, prev - 50))}
                    className="p-4 hover:bg-app-neon-magenta/20 rounded-xl text-white/40 hover:text-app-neon-magenta transition-all border border-transparent hover:border-app-neon-magenta/30"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Tu próxima oferta</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-black text-app-neon-cyan pt-1">DOP</span>
                      <input
                        type="number"
                        value={customBid}
                        onChange={(e) => setCustomBid(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-32 bg-transparent text-center font-black text-3xl text-white focus:outline-none border-b-2 border-transparent focus:border-app-neon-cyan transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setCustomBid(prev => prev + 50)}
                    className="p-4 hover:bg-app-neon-cyan/20 rounded-xl text-white/40 hover:text-app-neon-cyan transition-all border border-transparent hover:border-app-neon-cyan/30"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onPlaceBid(item, customBid)}
                  disabled={hasEnded}
                  className={`flex-1 relative overflow-hidden group py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all
                                ${hasEnded
                      ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                      : 'active:scale-95 text-black'
                    }`}
                >
                  {!hasEnded && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                    </>
                  )}
                  <div className="relative flex items-center justify-center gap-2">
                    <Zap className={`w-6 h-6 ${hasEnded ? 'text-white/10' : 'fill-black'}`} />
                    {hasEnded ? 'Subasta Finalizada' : 'Lanzar Puja'}
                  </div>
                </button>

                <button
                  onClick={() => onShare(item)}
                  className="px-6 py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
                >
                  <Share2 className="w-5 h-5 text-app-neon-cyan group-hover:scale-110 transition-transform" />
                  Compartir
                </button>
              </div>
            </div>
          </div>

          {/* Info Tabs / Highlights */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="glass p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center text-center gap-4 group hover:border-app-neon-cyan/30 transition-all">
              <div className="p-3 bg-app-neon-cyan/10 rounded-2xl text-app-neon-cyan group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-white text-[10px] uppercase tracking-[0.3em] mb-2">Garantía Segura</h4>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Protección de 30 días Certificada</p>
              </div>
            </div>
            <div className="glass p-6 rounded-[1.5rem] border border-white/5 flex flex-col items-center text-center gap-4 group hover:border-app-neon-magenta/30 transition-all">
              <div className="p-3 bg-app-neon-magenta/10 rounded-2xl text-app-neon-magenta group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-white text-[10px] uppercase tracking-[0.3em] mb-2">Envío Rápido</h4>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Nodos de Entrega en 3-5 días</p>
              </div>
            </div>
          </div>

          {/* Bid History Table (Mobile Only) - Shown after info tabs */}
          <div className="block lg:hidden mb-8">
            {renderBidHistory()}
          </div>

          {/* Description Section (Static) */}
          <div className="mt-8 border-t border-white/10 pt-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-1.5 bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Protocolo de Especificaciones</h3>
            </div>
            <div className="space-y-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] leading-loose">
              <p className="p-8 bg-white/5 rounded-[2rem] border border-white/5 italic text-white/60 backdrop-blur-sm">
                El {item.name} de {item.brand} representa la cúspide de la ingeniería móvil actual.
                Desbloquea el máximo potencial con una configuración de {item.specs}.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  'Display Ultra-XDR NextGen',
                  'Arquitectura Energética Inteligente',
                  'Óptica Profesional de Alta Gama',
                  'Módulo Quantum 5G Ready',
                  'Protección de Grado Aeroespacial',
                  'IA Neural Engine Integrado'
                ].map((spec, i) => (
                  <li key={i} className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-app-neon-cyan/40 transition-all">
                    <div className="w-2 h-2 bg-app-neon-cyan rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-pulse" />
                    <span className="group-hover:text-white transition-colors">{spec}</span>
                  </li>
                ))}
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