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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-app-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-app-neon-magenta/5 rounded-full blur-2xl animate-pulse delay-150" />
            </div>

            {/* Main content */}
            <div className="relative flex flex-col items-center gap-8 animate-[fadeInScale_1s_ease-out]">
                {/* Logo icon */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-app-neon-cyan rounded-3xl blur-2xl opacity-40 animate-pulse" />
                    <div className="relative glass p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500">
                        <Smartphone className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter animate-[slideUp_0.8s_ease-out_0.2s_both] font-sans">
                        La Ganga Phone
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta transition-all duration-1000"> RD</span>
                    </h1>
                    <p className="mt-4 text-xl text-white/40 font-bold uppercase tracking-[0.3em] animate-[slideUp_0.8s_ease-out_0.4s_both]">
                        Subastas de otro nivel
                    </p>
                </div>

                {/* Loading indicator */}
                <div className="flex items-center gap-3 mt-6 animate-[slideUp_0.8s_ease-out_0.6s_both]">
                    <div className="w-2.5 h-2.5 bg-app-neon-cyan rounded-full animate-bounce shadow-[0_0_10px_rgba(0,229,255,1)]" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-app-neon-cyan rounded-full animate-bounce shadow-[0_0_10px_rgba(0,229,255,1)]" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-app-neon-cyan rounded-full animate-bounce shadow-[0_0_10px_rgba(0,229,255,1)]" style={{ animationDelay: '300ms' }} />
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
