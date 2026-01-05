import 'supabase/config.dart';
import 'screens/product_detail_screen.dart';
import 'package:go_router/go_router.dart';
import 'auth/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/admin_dashboard_screen.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const AuthScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProductDetailScreen(productId: id);
      },
    ),
  ],
  redirect: (context, state) {
    final loggedIn = SupabaseConfig.client.auth.currentUser != null;
    final loggingIn = state.matchedLocation == '/';
    if (!loggedIn && !loggingIn) return '/';
    if (loggedIn && loggingIn) return '/home';
    return null;
  },
);
