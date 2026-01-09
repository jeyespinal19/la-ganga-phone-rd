
export interface Product {
  id: string;
  name: string;
  brand: string;
  specs: string;
  price: number;
  imageDetails: string;
  image_url?: string; // Alias for Supabase
  stock: number;
  originalPrice?: number;
}

export type Category = 'Todos' | 'Oukitel' | 'Samsung' | 'Xiaomi' | 'Hogar' | 'Hombre' | 'Oficina' | 'Industrial' | 'Deporte' | 'Mascotas';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  avatar?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    image_details: string;
    brand: string;
  };
}
export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  created_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  profiles?: {
    name: string;
    email: string;
  };
  stripe_payment_intent_id?: string;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  badge: string;
  active: boolean;
  order: number;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: 'new_order' | 'order_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}