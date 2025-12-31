import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
    onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message || 'Error al iniciar sesión');
                }
            } else {
                if (!name.trim()) {
                    setError('Por favor ingresa tu nombre');
                    setLoading(false);
                    return;
                }
                const { error } = await signUp(email, password, name);
                if (error) {
                    setError(error.message || 'Error al registrarse');
                } else {
                    setSuccess('¡Registro exitoso! Por favor verifica tu email.');
                }
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-app-muted hover:text-app-text transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </button>
                )}

                {/* Card */}
                <div className="glass rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.1)] relative overflow-hidden group">
                    {/* Decorative glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-app-neon-cyan/20 blur-[80px] rounded-full group-hover:bg-app-neon-cyan/30 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-app-neon-magenta/10 blur-[80px] rounded-full group-hover:bg-app-neon-magenta/20 transition-all duration-700"></div>

                    {/* Header */}
                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-app-neon-cyan/20 to-app-neon-magenta/20 rounded-2xl mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <User className="w-10 h-10 text-app-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h1>
                        <p className="text-app-muted">
                            {isLogin
                                ? 'Accede a tu cuenta de La Ganga Phone RD'
                                : 'Regístrate para participar en las subastas'}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-500 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field (Register Only) */}
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-app-text mb-2">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-app-muted" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-app-muted focus:outline-none focus:border-app-neon-cyan focus:ring-1 focus:ring-app-neon-cyan/50 transition-all backdrop-blur-sm"
                                        placeholder="Juan Pérez"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="relative z-10">
                            <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within/input:text-app-neon-cyan transition-colors">
                                    <Mail className="h-5 w-5 text-app-muted" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-app-muted focus:outline-none focus:border-app-neon-cyan focus:ring-1 focus:ring-app-neon-cyan/50 transition-all backdrop-blur-sm"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative z-10">
                            <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2 ml-1">
                                Contraseña
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within/input:text-app-neon-cyan transition-colors">
                                    <Lock className="h-5 w-5 text-app-muted" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-app-muted focus:outline-none focus:border-app-neon-cyan focus:ring-1 focus:ring-app-neon-cyan/50 transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {!isLogin && (
                                <p className="mt-2 text-[10px] text-white/40 ml-1">Mínimo 6 caracteres</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-app-neon-cyan to-app-neon-magenta opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center justify-center gap-2 py-3.5 px-4 text-white font-bold tracking-wide transition-transform group-active/btn:scale-95">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>{isLogin ? 'Iniciar Sesión' : 'Comenzar Ahora'}</>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Toggle Login/Register */}
                    <div className="mt-8 text-center relative z-10">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                            }}
                            className="text-white/60 hover:text-app-neon-cyan font-medium transition-all text-sm group/toggle"
                        >
                            {isLogin ? (
                                <span>¿No tienes cuenta? <span className="text-app-neon-cyan group-hover/toggle:underline">Regístrate gratis</span></span>
                            ) : (
                                <span>¿Ya tienes cuenta? <span className="text-app-neon-cyan group-hover/toggle:underline">Inicia sesión</span></span>
                            )}
                        </button>
                    </div>

                    {/* Forgot Password (Login Only) */}
                    {isLogin && (
                        <div className="mt-4 text-center relative z-10">
                            <button className="text-xs text-white/40 hover:text-white transition-colors">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-app-muted">
                    Al continuar, aceptas nuestros{' '}
                    <a href="#" className="text-app-accent hover:underline">
                        Términos de Servicio
                    </a>{' '}
                    y{' '}
                    <a href="#" className="text-app-accent hover:underline">
                        Política de Privacidad
                    </a>
                </p>
            </div>
        </div>
    );
};
