import 'package:flutter/material.dart';
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
