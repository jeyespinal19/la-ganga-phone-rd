import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/product_service.dart';

class ProductDetailScreen extends StatelessWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    final productService = ProductService();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del Producto'),
      ),
      body: FutureBuilder<Product>(
        future: productService.fetchById(productId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final product = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 8),
                Text('Marca: ${product.brand}'),
                const SizedBox(height: 8),
                if (product.specs != null) Text('Especificaciones: ${product.specs}'),
                const SizedBox(height: 8),
                Text('Precio actual: \$${product.currentBid.toStringAsFixed(2)}'),
                if (product.reservePrice != null)
                  Text('Precio de reserva: \$${product.reservePrice!.toStringAsFixed(2)}'),
                const SizedBox(height: 8),
                Text('Stock: ${product.stock}'),
                const SizedBox(height: 8),
                Text('Estado: ${product.status}'),
                const SizedBox(height: 8),
                Text('Finaliza: ${product.endsAt.toLocal()}'),
                // TODO: Add image display and bidding UI
              ],
            ),
          );
        },
      ),
    );
  }
}
