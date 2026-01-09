import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/config.dart';

class ProfileService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<Map<String, dynamic>?> getProfile(String userId) async {
    final response = await _client.from('profiles').select().eq('id', userId).maybeSingle();
    return response;
  }

  Future<void> updateProfile(String userId, Map<String, dynamic> data) async {
    await _client.from('profiles').update(data).eq('id', userId);
  }

  Future<List<Map<String, dynamic>>> getOrders(String userId) async {
    final response = await _client
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response as List);
  }

  Future<void> createOrder(String userId, double total, List<Map<String, dynamic>> items) async {
    // Basic order creation
    final orderResponse = await _client.from('orders').insert({
      'user_id': userId,
      'total': total,
      'status': 'pending',
    }).select().single();

    final orderId = orderResponse['id'];

    final orderItems = items.map((item) => {
      'order_id': orderId,
      'product_id': item['product_id'],
      'quantity': item['quantity'],
      'price': item['price'],
    }).toList();

    await _client.from('order_items').insert(orderItems);
  }

  /// Admin: Get all orders from all users
  Future<List<Map<String, dynamic>>> getAllOrders() async {
    final response = await _client
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response as List);
  }

  /// Admin: Update order status
  Future<void> updateOrderStatus(String orderId, String status) async {
    await _client.from('orders').update({'status': status}).eq('id', orderId);
  }

  /// User: Get saved addresses
  Future<List<Map<String, dynamic>>> getAddresses(String userId) async {
    final response = await _client
        .from('addresses')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response as List);
  }

  /// User: Add new address
  Future<void> addAddress(Map<String, dynamic> data) async {
    // Expected fields: label (String), address (JSON), user_id (String)
    await _client.from('addresses').insert(data);
  }

  /// User: Delete address
  Future<void> deleteAddress(String id) async {
    await _client.from('addresses').delete().eq('id', id);
  }
}
