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
        <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-200/40 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-[100px] animate-pulse" />

            <div className="max-w-md w-full relative z-10">
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-8 flex items-center gap-3 text-gray-400 hover:text-blue-600 transition-all group font-bold text-sm"
                    >
                        <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Regresar
                    </button>
                )}

                {/* Card */}
                <div className="glass rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.1)] relative overflow-hidden group">
                    {/* Decorative glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-app-neon-cyan/20 blur-[80px] rounded-full group-hover:bg-app-neon-cyan/30 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-app-neon-magenta/10 blur-[80px] rounded-full group-hover:bg-app-neon-magenta/20 transition-all duration-700"></div>

                    {/* Header */}
                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2rem] mb-6 border border-white shadow-xl shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h1>
                        <p className="text-blue-600/60 font-black text-[10px] uppercase tracking-[0.2em] mb-4 italic">Bienvenido de nuevo</p>
                        <p className="text-gray-400 font-medium">
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
                                <label htmlFor="name" className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">
                                    Nombre Completo
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within/input:text-blue-600 transition-colors">
                                        <User className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                        placeholder="Juan Pérez"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="relative z-10">
                            <label htmlFor="email" className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within/input:text-blue-600 transition-colors">
                                    <Mail className="h-5 w-5 text-gray-300" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative z-10">
                            <label htmlFor="password" className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">
                                Contraseña
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within/input:text-blue-600 transition-colors">
                                    <Lock className="h-5 w-5 text-gray-300" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {!isLogin && (
                                <p className="mt-2 text-[10px] text-gray-400 ml-1">Mínimo 6 caracteres</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Accediendo al sistema...
                                </>
                            ) : (
                                <>{isLogin ? 'Iniciar Sesión' : 'Próximo Paso'}</>
                            )}
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
                            className="text-gray-400 hover:text-blue-600 font-bold transition-all text-sm group/toggle"
                        >
                            {isLogin ? (
                                <span>¿Nuevo en La Ganga? <span className="text-blue-500 group-hover/toggle:underline">Crea una cuenta</span></span>
                            ) : (
                                <span>¿Ya eres cliente? <span className="text-blue-500 group-hover/toggle:underline">Inicia sesión</span></span>
                            )}
                        </button>
                    </div>

                    {/* Forgot Password (Login Only) */}
                    {isLogin && (
                        <div className="mt-6 text-center relative z-10">
                            <button className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Al continuar, aceptas nuestros{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                        Términos
                    </a>{' '}
                    y{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                        Privacidad
                    </a>
                </p>
            </div>
        </div>
    );
};
