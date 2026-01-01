import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';
import { productService } from '../services/productService';

const DEFAULT_SLIDES = [
    {
        id: '1',
        image_url: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&q=80&w=1200',
        title: 'iPhone 15 Pro',
        subtitle: 'Titanium. Fuerte y ligero.',
        badge: 'NUEVO',
        active: true,
        order: 0
    },
    {
        id: '2',
        image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1200',
        title: 'Samsung S24 Ultra',
        subtitle: 'La IA llega para revolucionarlo todo',
        badge: 'OFERTA',
        active: true,
        order: 1
    }
];

export const PromoBanner: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBanners = async () => {
            try {
                const data = await productService.getBanners();
                setBanners(data.length > 0 ? data : (DEFAULT_SLIDES as Banner[]));
            } catch (error) {
                console.error('Error loading banners:', error);
                setBanners(DEFAULT_SLIDES as Banner[]);
            } finally {
                setLoading(false);
            }
        };
        loadBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

    if (loading) {
        return <div className="w-full h-40 sm:h-52 bg-gray-50 flex items-center justify-center rounded-2xl animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
        </div>;
    }

    return (
        <div className="relative w-full h-40 sm:h-54 overflow-hidden bg-gray-100 mb-4 rounded-2xl shadow-xl shadow-blue-500/5">
            <div
                className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {banners.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative flex items-center group">
                        {/* Background Image with Gradient Overlay */}
                        <div className="absolute inset-0">
                            <img
                                src={slide.image_url}
                                className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
                                alt={slide.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative px-8 py-4 text-white z-10 w-full sm:w-2/3 animate-in fade-in slide-in-from-left-8 duration-700">
                            <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-[9px] font-black rounded-lg mb-3 shadow-lg shadow-yellow-400/20">
                                {slide.badge}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-black leading-tight mb-2 drop-shadow-2xl">
                                {slide.title}
                            </h2>
                            <p className="text-sm font-bold opacity-90 leading-tight drop-shadow-lg mb-4">
                                {slide.subtitle}
                            </p>
                            <button className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                                Ver detalles
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all z-20 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all z-20 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-8 flex gap-2 z-20">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-white w-8' : 'bg-white/30 w-3 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
