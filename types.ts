
export interface Product {
  id: string;
  name: string;
  brand: string;
  specs: string;
  price: number;
  imageDetails: string;
  stock: number;
  originalPrice?: number; // Optional: for showing "scratch" price
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
}
export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  shipping_address: any;
  created_at: string;
  items: OrderItem[];
  stripe_payment_intent_id?: string;
}