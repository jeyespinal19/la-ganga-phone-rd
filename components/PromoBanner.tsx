import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    badge: string;
    gradient: string;
}

const slides: Slide[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1556656793-062ff987b48e?auto=format&fit=crop&q=80&w=800',
        title: 'Oukitel WP19',
        subtitle: 'Batería de 21,000mAh para aventureros',
        badge: 'OFERTA LIMITADA',
        gradient: 'from-orange-600 to-red-600'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
        title: 'Samsung S24 Ultra',
        subtitle: 'La IA llega a tus manos',
        badge: 'NUEVO',
        gradient: 'from-blue-600 to-indigo-600'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
        title: 'Xiaomi 14 Pro',
        subtitle: 'Cámara Leica de última generación',
        badge: 'MÁS VENDIDO',
        gradient: 'from-purple-600 to-pink-600'
    }
];

export const PromoBanner: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-40 sm:h-52 overflow-hidden bg-gray-100 mb-4">
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative flex items-center">
                        {/* Background Image with Gradient Overlay */}
                        <div className="absolute inset-0">
                            <img
                                src={slide.image}
                                className="w-full h-full object-cover"
                                alt={slide.title}
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80 mix-blend-multiply`} />
                        </div>

                        {/* Content */}
                        <div className="relative px-6 py-4 text-white z-10 w-2/3">
                            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded mb-2">
                                {slide.badge}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black leading-tight mb-1 drop-shadow-md">
                                {slide.title}
                            </h2>
                            <p className="text-sm font-medium opacity-90 leading-tight drop-shadow-sm">
                                {slide.subtitle}
                            </p>
                            <button className="mt-3 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-100 transition-colors">
                                Ver oferta
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors z-20"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors z-20"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 right-6 flex gap-1.5 z-20">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                ))}
            </div>
        </div>
    );
};
