import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
    duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    onComplete,
    duration = 3000
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, duration - 500);

        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, duration);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#050b14] via-[#0a1628] to-[#0f172a] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-150" />
            </div>

            {/* Main content */}
            <div className="relative flex flex-col items-center gap-6 animate-[fadeInScale_0.8s_ease-out]">
                {/* Logo icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
                        <Smartphone className="w-16 h-16 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight animate-[slideUp_0.6s_ease-out_0.2s_both]">
                        La Ganga Phone
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> RD</span>
                    </h1>
                    <p className="mt-3 text-lg text-blue-200/70 animate-[slideUp_0.6s_ease-out_0.4s_both]">
                        Subastas en vivo de teléfonos móviles
                    </p>
                </div>

                {/* Loading indicator */}
                <div className="flex items-center gap-2 mt-4 animate-[slideUp_0.6s_ease-out_0.6s_both]">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>

            {/* Custom keyframes */}
            <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};
