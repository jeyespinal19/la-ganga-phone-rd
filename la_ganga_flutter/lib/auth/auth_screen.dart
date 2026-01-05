import 'package:flutter/material.dart';
import 'package:supabase_auth_ui/supabase_auth_ui.dart';
import '../supabase/config.dart';
import '../router.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SupabaseAuth(
      supabase: SupabaseConfig.client,
      // After successful sign‑in, go to the home route
      onSignedIn: (session) {
        // Replace the current location with /home
        router.go('/home');
      },
    );
  }
}
