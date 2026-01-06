import 'package:flutter/material.dart';
import 'package:supabase_auth_ui/supabase_auth_ui.dart';
import '../supabase/config.dart';
import '../router.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SupaEmailAuth(
      onSignInComplete: (response) {
        router.go('/home');
      },
      onSignUpComplete: (response) {
        router.go('/home');
      },
    );
  }
}
