import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = 'https://aslefanefuemtowgkqhd.supabase.co';
  static const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGVmYW5lZnVlbXRvd2drcWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU4MzcsImV4cCI6MjA4MjcwMTgzN30.nrnWwoTTV0_u6J46O45sFUJa0EhM7KDiDB5CoVAuX6k';

  static Future<void> init() async {
    await Supabase.initialize(url: url, anonKey: anonKey);
  }

  static SupabaseClient get client => Supabase.instance.client;
}
