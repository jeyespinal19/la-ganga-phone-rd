import { supabase } from './supabase';

interface NotificationPreferences {
    outbid_notifications: boolean;
    auction_ending_notifications: boolean;
    new_product_notifications: boolean;
    push_enabled: boolean;
    email_enabled: boolean;
}

class NotificationService {
    private permission: NotificationPermission = 'default';

    constructor() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    // Request notification permission
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    // Show a notification
    showNotification(title: string, options?: NotificationOptions) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        // Check if the page is in focus
        if (document.hidden) {
            new Notification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                ...options,
            } as any);
        }
    }

    // Notify when outbid
    notifyOutbid(productName: string, newBid: number) {
        this.showNotification('¡Te han superado!', {
            body: `Alguien pujó DOP ${newBid.toLocaleString()} en ${productName}`,
            tag: 'outbid',
            requireInteraction: true,
            actions: [
                { action: 'view', title: 'Ver Subasta' },
                { action: 'close', title: 'Cerrar' },
            ],
        });
    }

    // Notify when auction is ending soon
    notifyAuctionEnding(productName: string, timeLeft: string) {
        this.showNotification('Subasta por terminar', {
            body: `${productName} termina en ${timeLeft}`,
            tag: 'ending-soon',
            requireInteraction: false,
        });
    }

    // Notify when new product is added
    notifyNewProduct(productName: string) {
        this.showNotification('Nuevo producto', {
            body: `${productName} está disponible para pujar`,
            tag: 'new-product',
            requireInteraction: false,
        });
    }

    // Get user notification preferences
    async getPreferences(userId: string): Promise<NotificationPreferences | null> {
        try {
            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return null;
        }
    }

    // Update user notification preferences
    async updatePreferences(
        userId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notification_preferences')
                .update(preferences)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            return false;
        }
    }

    // Subscribe to realtime bid updates for user's items
    subscribeToUserBids(
        userId: string,
        userBids: { itemId: string; amount: number }[],
        onOutbid: (itemId: string, newBid: number) => void
    ) {
        const channel = supabase
            .channel('user-bids')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bids',
                },
                (payload: any) => {
                    const newBid = payload.new;

                    // Check if this bid is on an item the user is bidding on
                    const userBid = userBids.find(
                        (bid) => bid.itemId === newBid.product_id
                    );

                    // If user was winning and someone else bid higher
                    if (userBid && newBid.user_id !== userId && newBid.amount > userBid.amount) {
                        onOutbid(newBid.product_id, newBid.amount);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}

export const notificationService = new NotificationService();
