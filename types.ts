
export interface Product {
  id: string;
  name: string;
  brand: string;
  specs: string;
  price: number;
  imageDetails: string;
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