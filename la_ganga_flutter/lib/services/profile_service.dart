import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/config.dart';

class ProfileService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<Map<String, dynamic>?> getProfile(String userId) async {
    final response = await _client.from('profiles').select().eq('id', userId).maybeSingle();
    return response as Map<String, dynamic>?;
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
}
