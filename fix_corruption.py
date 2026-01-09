
import os

main_dart = """import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'supabase/config.dart';
import 'router.dart';
import 'providers/cart_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseConfig.init();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'La Ganga Phone',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F2027),
        primaryColor: const Color(0xFF4ADE80),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF4ADE80),
          secondary: Color(0xFF22C55E),
          surface: Color(0xFF203A43),
          error: Colors.redAccent,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F2027),
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF4ADE80),
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.1),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          hintStyle: const TextStyle(color: Colors.white38),
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
      builder: (context, widget) {
        ErrorWidget.builder = (FlutterErrorDetails details) {
          return Material(
            child: Container(
              color: const Color(0xFF0F2027),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                      const SizedBox(height: 16),
                      const Text(
                        'Algo salió mal con los datos',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Estamos trabajando para solucionarlo. Por favor intenta recargar.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white70),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => router.go('/'),
                        child: const Text('Volver al Inicio'),
                      )
                    ],
                  ),
                ),
              ),
            ),
          );
        };
        return widget!;
      },
    );
  }
}
"""

shimmer_dart = """import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ProductSkeleton extends StatelessWidget {
  const ProductSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.white10,
      highlightColor: Colors.white24,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

class BannerSkeleton extends StatelessWidget {
  const BannerSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.white10,
      highlightColor: Colors.white24,
      child: Container(
        height: 180,
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

class ProductDetailSkeleton extends StatelessWidget {
  const ProductDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.white10,
      highlightColor: Colors.white24,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 350,
              width: double.infinity,
              color: Colors.white12,
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 12, width: 80, color: Colors.white12),
                  const SizedBox(height: 12),
                  Container(height: 30, width: 250, color: Colors.white12),
                  const SizedBox(height: 24),
                  Container(height: 40, width: 150, color: Colors.white12),
                  const SizedBox(height: 32),
                  Container(height: 18, width: 120, color: Colors.white12),
                  const SizedBox(height: 12),
                  Container(height: 100, width: double.infinity, color: Colors.white12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
"""

with open('la_ganga_flutter/lib/main.dart', 'w', encoding='utf-8') as f:
    f.write(main_dart.strip() + '\\n')

with open('la_ganga_flutter/lib/widgets/shimmer_skeletons.dart', 'w', encoding='utf-8') as f:
    f.write(shimmer_dart.strip() + '\\n')

print("Files rewritten successfully.")
