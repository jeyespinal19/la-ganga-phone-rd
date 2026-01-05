import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';
import '../supabase/config.dart';

class ProductService {
  final SupabaseClient _client = SupabaseConfig.client;

  /// Fetch all products ordered by creation date.
  Future<List<Product>> fetchAll() async {
    final response = await _client.from('products').select().order('created_at');
    final data = response as List<dynamic>;
    return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Fetch a single product by its UUID.
  Future<Product> fetchById(String id) async {
    final response = await _client.from('products').select().eq('id', id).single();
    final data = response as Map<String, dynamic>;
    return Product.fromJson(data);
  }
}
