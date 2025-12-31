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
                <div className="bg-app-card rounded-2xl shadow-2xl p-8 border border-app-border">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-app-accent/10 rounded-full mb-4">
                            <User className="w-8 h-8 text-app-accent" />
                        </div>
                        <h1 className="text-3xl font-bold text-app-text mb-2">
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
                                        className="block w-full pl-11 pr-4 py-3 bg-app-bg border border-app-border rounded-xl text-app-text placeholder-app-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all"
                                        placeholder="Juan Pérez"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-app-text mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-app-muted" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-app-bg border border-app-border rounded-xl text-app-text placeholder-app-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-app-text mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-app-muted" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-app-bg border border-app-border rounded-xl text-app-text placeholder-app-muted focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {!isLogin && (
                                <p className="mt-2 text-xs text-app-muted">Mínimo 6 caracteres</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-app-accent hover:bg-app-accentHover text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Register */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                            }}
                            className="text-app-accent hover:text-app-accentHover font-medium transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>

                    {/* Forgot Password (Login Only) */}
                    {isLogin && (
                        <div className="mt-4 text-center">
                            <button className="text-sm text-app-muted hover:text-app-text transition-colors">
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
