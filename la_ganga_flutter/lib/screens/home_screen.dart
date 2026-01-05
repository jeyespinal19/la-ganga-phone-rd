import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/product_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final productService = ProductService();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Productos'),
      ),
      body: FutureBuilder<List<Product>>(
        future: productService.fetchAll(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final products = snapshot.data ?? [];
          if (products.isEmpty) {
            return const Center(child: Text('No hay productos'));
          }
          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final p = products[index];
              return ListTile(
                title: Text(p.name),
                subtitle: Text('Marca: ${p.brand}\nPrecio actual: \$${p.currentBid.toStringAsFixed(2)}'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {
                  // TODO: navigate to product detail screen
                },
              );
            },
          );
        },
      ),
    );
  }
}
