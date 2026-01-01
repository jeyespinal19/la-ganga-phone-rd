
import { supabase } from './supabase';
import { Product, User, Order, Banner } from '../types';

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
        stock: item.stock || 0,
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
    try {
      const { error } = await supabase.from('products').insert({
        name: item.name,
        brand: item.brand,
        specs: item.specs,
        current_bid: item.price, // Saving Price to current_bid column
        reserve_price: item.originalPrice,
        stock: item.stock,
        image_details: item.imageDetails,
        status: 'active'
      });

      if (error) throw error;
    } catch (err) {
      console.error('Add item error:', err);
      throw err;
    }
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>) {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.specs !== undefined) updateData.specs = updates.specs;
      if (updates.price !== undefined) updateData.current_bid = updates.price;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
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

  // --- User Addresses ---

  async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (error) throw error;
    return data;
  }

  async addAddress(address: any) {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert(address)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAddress(id: string) {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async updateAddress(id: string, updates: any) {
    const { error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
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

      // 3. Decrement Stock
      // Note: In a real app, this should be a stored procedure or transaction to ensure atomicity
      for (const item of items) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity: item.quantity });
      }

      return orderData.id;

    } catch (err) {
      console.error('Create order error:', err);
      throw err;
    }
  }
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any;
  }

  async createPaymentIntent(orderId: string, amount: number) {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { orderId, amount, currency: 'dop' }
    });
    if (error) throw error;
    return data;
  }

  // --- Admin Methods ---

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
    return true;
  }

  // --- Banners ---
  async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async addBanner(banner: Omit<Banner, 'id'>) {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteBanner(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async uploadBannerImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('banners')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

}
export const productService = new ProductService();
