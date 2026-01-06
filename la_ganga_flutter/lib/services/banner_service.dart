import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/config.dart';

class BannerService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<List<Map<String, dynamic>>> fetchBanners() async {
    final response = await _client.from('banners').select().order('order');
    return List<Map<String, dynamic>>.from(response as List);
  }
}
