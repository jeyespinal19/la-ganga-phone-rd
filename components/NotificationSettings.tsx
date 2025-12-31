import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, MailX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

export const NotificationSettings: React.FC = () => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        outbid_notifications: true,
        auction_ending_notifications: true,
        new_product_notifications: false,
        push_enabled: false,
        email_enabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, [user]);

    const loadPreferences = async () => {
        if (!user) return;

        const prefs = await notificationService.getPreferences(user.id);
        if (prefs) {
            setPreferences(prefs);
        }
        setLoading(false);
    };

    const handleToggle = async (key: keyof typeof preferences) => {
        const newValue = !preferences[key];

        // If enabling push notifications, request permission
        if (key === 'push_enabled' && newValue) {
            const granted = await notificationService.requestPermission();
            if (!granted) {
                alert('Por favor permite las notificaciones en tu navegador');
                return;
            }
        }

        const newPreferences = { ...preferences, [key]: newValue };
        setPreferences(newPreferences);

        // Save to database
        setSaving(true);
        if (user) {
            await notificationService.updatePreferences(user.id, { [key]: newValue });
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="text-app-muted">Cargando preferencias...</div>;
    }

    return (
        <div className="bg-app-card rounded-2xl p-6 border border-app-border">
            <h3 className="text-xl font-bold text-app-text mb-4">Notificaciones</h3>

            <div className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                    <div className="flex items-center gap-3">
                        {preferences.push_enabled ? (
                            <Bell className="w-5 h-5 text-app-accent" />
                        ) : (
                            <BellOff className="w-5 h-5 text-app-muted" />
                        )}
                        <div>
                            <p className="font-medium text-app-text">Notificaciones Push</p>
                            <p className="text-sm text-app-muted">Recibe alertas en tiempo real</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleToggle('push_enabled')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.push_enabled ? 'bg-app-accent' : 'bg-app-border'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.push_enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                    <div className="flex items-center gap-3">
                        {preferences.email_enabled ? (
                            <Mail className="w-5 h-5 text-app-accent" />
                        ) : (
                            <MailX className="w-5 h-5 text-app-muted" />
                        )}
                        <div>
                            <p className="font-medium text-app-text">Notificaciones por Email</p>
                            <p className="text-sm text-app-muted">Recibe resúmenes diarios</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleToggle('email_enabled')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_enabled ? 'bg-app-accent' : 'bg-app-border'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Outbid Notifications */}
                <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                    <div>
                        <p className="font-medium text-app-text">Cuando me superen en una puja</p>
                        <p className="text-sm text-app-muted">Te avisaremos inmediatamente</p>
                    </div>
                    <button
                        onClick={() => handleToggle('outbid_notifications')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.outbid_notifications ? 'bg-app-accent' : 'bg-app-border'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.outbid_notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Auction Ending */}
                <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                    <div>
                        <p className="font-medium text-app-text">Subastas por terminar</p>
                        <p className="text-sm text-app-muted">Alertas 1 hora antes</p>
                    </div>
                    <button
                        onClick={() => handleToggle('auction_ending_notifications')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.auction_ending_notifications ? 'bg-app-accent' : 'bg-app-border'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.auction_ending_notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* New Products */}
                <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                    <div>
                        <p className="font-medium text-app-text">Nuevos productos</p>
                        <p className="text-sm text-app-muted">Cuando se agreguen subastas</p>
                    </div>
                    <button
                        onClick={() => handleToggle('new_product_notifications')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.new_product_notifications ? 'bg-app-accent' : 'bg-app-border'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.new_product_notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {saving && (
                <p className="mt-4 text-sm text-app-muted text-center">Guardando...</p>
            )}
        </div>
    );
};
