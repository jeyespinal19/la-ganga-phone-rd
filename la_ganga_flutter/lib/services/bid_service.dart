import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/config.dart';

class Bid {
  final String id;
  final String productId;
  final String userId;
  final double amount;
  final DateTime createdAt;
  final String? userName;

  Bid({
    required this.id,
    required this.productId,
    required this.userId,
    required this.amount,
    required this.createdAt,
    this.userName,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    return Bid(
      id: (json['id'] as String?) ?? '',
      productId: (json['product_id'] as String?) ?? '',
      userId: (json['user_id'] as String?) ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['created_at'] != null 
          ? (DateTime.tryParse(json['created_at'] as String) ?? DateTime.now())
          : DateTime.now(),
      userName: json['user_name'] as String?,
    );
  }
}

class BidService {
  final SupabaseClient _client = SupabaseConfig.client;

  /// Place a new bid on a product.
  Future<void> placeBid(String productId, double amount) async {
    final userId = _client.auth.currentUser!.id;
    
    // We insert into 'bids'. The database trigger 'on_new_bid' handles validation and updating the product's current_bid.
    await _client.from('bids').insert({
      'product_id': productId,
      'user_id': userId,
      'amount': amount,
    });
  }

  /// Get a stream of bids for a specific product for real-time updates.
  Stream<List<Bid>> getBidStream(String productId) {
    return _client
        .from('bids')
        .stream(primaryKey: ['id'])
        .eq('product_id', productId)
        .order('amount', ascending: false)
        .map((data) => data.map((e) => Bid.fromJson(e)).toList());
  }
}
