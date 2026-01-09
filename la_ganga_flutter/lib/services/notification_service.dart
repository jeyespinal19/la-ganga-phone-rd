
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification_model.dart';
import '../supabase/config.dart';

class NotificationService {
  final SupabaseClient _client = SupabaseConfig.client;

  // Stream notifications for a specific user (or admin if userId is null)
  Stream<List<AppNotification>> streamNotifications({String? userId}) {
    // Note: Supabase stream filters are limited. 
    // We'll use a simple query first, but for real-time we might need a channel subscription
    // similar to the web version if we want highly specific event handling.
    // However, the simplest way in Flutter to get a live list is .stream()
    
    var query = _client
      .from('notifications')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false)
      .limit(20);

    if (userId != null) {
      return query.eq('user_id', userId).map((event) => 
        event.map((e) => AppNotification.fromJson(e)).toList()
      );
    } else {
      // For admin (global notifications where user_id is null)
      // Supabase .stream() equality filter for NULL might be tricky with .eq('user_id', null)
      // It normally expects a value. Let's try to map it manually if needed, or use a workaround.
      // But .stream() doesn't support .is_('user_id', null) as cleanly as the JS SDK sometimes.
      // We will try .eq('user_id', 'null') or just filter client side if the volume is low, 
      // but strictly speaking streaming 'null' values is a known nuance.
      
      // Attempting Filter:
      // Since .stream() uses PostgREST syntax under the hood but exposes a limited API in Dart.
      // A common workaround for NULL streams is not always straightforward.
      // For now, let's assume valid userIds or handle filtering in the UI if we fetch all.
      // BUT, we want to be secure. 
      // Let's use a standard fetch for now and a RealtimeSubscription for updates, 
      // creating a custom stream controller if .stream() fails for nulls.
      
      return query.map((event) {
        final notifications = event.map((e) => AppNotification.fromJson(e)).toList();
        // Client-side filter for null user_id (Admin) just in case the query returns more (RLS should handle it though)
        return notifications.where((n) => n.userId == null).toList();
      });
    }
  }

  // Mark ad read
  Future<void> markAsRead(String id) async {
    await _client.from('notifications').update({'is_read': true}).eq('id', id);
  }

  Future<void> markAllAsRead(String? userId) async {
    var query = _client.from('notifications').update({'is_read': true});
    
    if (userId != null) {
      await query.eq('user_id', userId);
    } else {
      await query.is_('user_id', null);
    }
  }
}
