import '../supabase/config.dart';

class BrandService {
  final _client = SupabaseConfig.client;

  /// Fetch all brands ordered by position.
  Future<List<String>> fetchBrands() async {
    final response = await _client
        .from('brands')
        .select('name')
        .order('position', ascending: true);
    final data = response as List<dynamic>;
    return data.map((e) => e['name'] as String).toList();
  }

  /// Add a new brand if it does not already exist.
  Future<void> addBrand(String name) async {
    // Upsert to avoid duplicates (name is unique)
    await _client.from('brands').upsert({'name': name}, onConflict: 'name');
  }
}
