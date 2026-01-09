
import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../services/supabase';
import { productService } from '../services/productService';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationBellProps {
    userId?: string; // If undefined, it's for Admin (global)
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: userId ? `user_id=eq.${userId}` : 'user_id=is.null'
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Play sound
                    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => { });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const data = await productService.getNotifications(userId);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await productService.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-sm text-gray-900">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">No tienes notificaciones</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notif.is_read ? 'bg-green-50/30' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="space-y-1 flex-1">
                                                    <p className={`text-xs ${!notif.is_read ? 'font-black text-gray-900' : 'font-medium text-gray-600'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                                                    </p>
                                                </div>
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={(e) => markAsRead(notif.id, e)}
                                                        className="text-green-600 p-1 hover:bg-green-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Marcar como leída"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {!notif.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
