
import { supabase } from './supabase';
import { Product, User } from '../types';

// Mock users for fallback or just general usage
const MOCK_USERS: User[] = [
  { id: '1', name: 'Usuario Prueba', email: 'test@example.com', role: 'user', status: 'active' }
];

class ProductService {

  // --- Data Fetching ---

  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        specs: item.specs || '',
        price: Number(item.current_bid), // Using current_bid as Price
        imageDetails: item.image_details,
        originalPrice: item.reserve_price ? Number(item.reserve_price) : undefined
      }));

    } catch (err) {
      console.error('Supabase connection failed:', err);
      return [];
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;

      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        avatar: u.avatar_seed || '1'
      }));

    } catch (err) {
      return MOCK_USERS;
    }
  }

  // --- CRUD Actions (Admin) ---

  async addProduct(item: Omit<Product, 'id'>) {
    const { error } = await supabase.from('products').insert({
      name: item.name,
      brand: item.brand,
      specs: item.specs,
      current_bid: item.price, // Saving Price to current_bid column
      reserve_price: item.originalPrice,
      image_details: item.imageDetails,
      status: 'active'
    });

    if (error) console.error('Add item error:', error);
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>) {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.specs !== undefined) updateData.specs = updates.specs;
      if (updates.price !== undefined) updateData.current_bid = updates.price;
      if (updates.originalPrice !== undefined) updateData.reserve_price = updates.originalPrice;
      if (updates.imageDetails !== undefined) updateData.image_details = updates.imageDetails;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

    } catch (err) {
      console.error('Update item error:', err);
      throw err;
    }
  }

  async deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
  }

  // --- Orders ---

  async createOrder(userId: string, total: number, shippingAddress: any, items: { id: string, price: number, quantity: number }[]) {
    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: total,
          status: 'pending',
          shipping_address: shippingAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData.id;

    } catch (err) {
      console.error('Create order error:', err);
      throw err;
    }
  }
}

export const productService = new ProductService();
