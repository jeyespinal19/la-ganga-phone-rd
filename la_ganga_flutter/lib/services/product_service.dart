import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';
import '../supabase/config.dart';
import 'dart:typed_data';

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
    final data = response;
    return Product.fromJson(data);
  }

  /// Create a new product.
  Future<void> create(Map<String, dynamic> productData) async {
    await _client.from('products').insert(productData);
  }

  /// Update an existing product.
  Future<void> update(String id, Map<String, dynamic> productData) async {
    await _client.from('products').update(productData).eq('id', id);
  }

  /// Delete a product.
  Future<void> delete(String id) async {
    await _client.from('products').delete().eq('id', id);
  }

  /// Upload an image to Supabase Storage.
  Future<String> uploadImage(String path, Uint8List bytes) async {
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _client.storage.from('products').uploadBinary(fileName, bytes);
    final String publicUrl = _client.storage.from('products').getPublicUrl(fileName);
    return publicUrl;
  }
}
