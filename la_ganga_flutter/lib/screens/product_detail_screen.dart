import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import 'package:go_router/go_router.dart';
import '../widgets/shimmer_skeletons.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ProductService _productService = ProductService();
  
  void _addToCart(Product product) {
    context.read<CartProvider>().addItem(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${product.name} añadido al carrito'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF22C55E),
        action: SnackBarAction(
          label: 'VER CARRITO',
          textColor: Colors.white,
          onPressed: () => context.push('/cart'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F2027),
      body: FutureBuilder<Product>(
        future: _productService.fetchById(widget.productId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const ProductDetailSkeleton();
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.white)));
          }
          final product = snapshot.data;
          if (product == null) {
            return const Center(child: Text('Producto no encontrado', style: TextStyle(color: Colors.white)));
          }

          return Scaffold(
            backgroundColor: const Color(0xFF0F2027),
            body: CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 350,
                  pinned: true,
                  backgroundColor: const Color(0xFF0F2027),
                  leading: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  actions: [
                    Consumer<CartProvider>(
                      builder: (context, cart, child) {
                        return Stack(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                              onPressed: () => context.push('/cart'),
                            ),
                            if (cart.itemCount > 0)
                              Positioned(
                                right: 8,
                                top: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF22C55E),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 16,
                                    minHeight: 16,
                                  ),
                                  child: Text(
                                    '${cart.itemCount}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                  ],
                  flexibleSpace: FlexibleSpaceBar(
                    background: Hero(
                      tag: 'product-${product.id}',
                      child: product.imageUrl.startsWith('http')
                          ? Image.network(product.imageUrl, fit: BoxFit.cover)
                          : const Center(child: Icon(Icons.phone_iphone, size: 100, color: Colors.white24)),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Container(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product.brand.toUpperCase(),
                                    style: const TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.bold, letterSpacing: 1.2, fontSize: 13),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    product.name,
                                    style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: product.stock > 0 ? Colors.greenAccent.withOpacity(0.1) : Colors.redAccent.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                product.stock > 0 ? 'EN STOCK' : 'AGOTADO',
                                style: TextStyle(
                                  color: product.stock > 0 ? Colors.greenAccent : Colors.redAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '\$${product.price.toStringAsFixed(0)}',
                              style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900),
                            ),
                            const SizedBox(width: 12),
                            if (product.originalPrice != null)
                              Text(
                                '\$${product.originalPrice!.toStringAsFixed(0)}',
                                style: const TextStyle(color: Colors.white30, fontSize: 18, decoration: TextDecoration.lineThrough),
                              ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'Especificaciones',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          product.specs ?? 'No hay especificaciones disponibles para este producto.',
                          style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 16, height: 1.6),
                        ),
                        const SizedBox(height: 32),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.local_shipping_outlined, color: Color(0xFF4ADE80)),
                              SizedBox(width: 15),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Envío Gratis', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                    Text('Entrega en 24-48 horas en todo RD', style: TextStyle(color: Colors.white54, fontSize: 12)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 120),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            bottomNavigationBar: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF1a1a1a),
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                boxShadow: [BoxShadow(color: Colors.black54, blurRadius: 20)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton(
                      onPressed: product.stock > 0 ? () => _addToCart(product) : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF22C55E),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        elevation: 5,
                        disabledBackgroundColor: Colors.white10,
                      ),
                      child: Text(
                        product.stock > 0 ? 'AÑADIR AL CARRITO' : 'AGOTADO',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
