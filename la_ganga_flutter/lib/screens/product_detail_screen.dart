import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import '../services/bid_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ProductService _productService = ProductService();
  final BidService _bidService = BidService();
  final TextEditingController _bidController = TextEditingController();

  Future<void> _placeBid(double currentBid) async {
    final amount = double.tryParse(_bidController.text);
    if (amount == null || amount <= currentBid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor ingresa un monto válido mayor a la puja actual')),
      );
      return;
    }

    try {
      await _bidService.placeBid(widget.productId, amount);
      _bidController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('¡Puja realizada con éxito!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al realizar la puja: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _bidController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('La Ganga - Detalle'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: FutureBuilder<Product>(
        future: _productService.fetchById(widget.productId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final product = snapshot.data!;

          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Image Placeholder (Replace with real image later)
                    Container(
                      height: 250,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white24),
                      ),
                      child: const Icon(Icons.phone_iphone, size: 100, color: Colors.white54),
                    ),
                    const SizedBox(height: 25),
                    Text(
                      product.name,
                      style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      product.brand,
                      style: TextStyle(color: Colors.blueAccent.shade100, fontSize: 18),
                    ),
                    const SizedBox(height: 15),
                    
                    // Stats Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _infoCard('Puja Actual', '\$${product.currentBid.toStringAsFixed(2)}', Icons.gavel),
                        _infoCard('Vence en', _formatDuration(product.endsAt), Icons.timer),
                      ],
                    ),
                    
                    const SizedBox(height: 25),
                    const Text(
                      'Información',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      product.specs ?? 'Sin especificaciones disponibles.',
                      style: const TextStyle(color: Colors.white70, fontSize: 16),
                    ),
                    
                    const SizedBox(height: 30),
                    const Text(
                      'Últimas Pujas',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    
                    // Real-time Bids Stream
                    SizedBox(
                      height: 200,
                      child: StreamBuilder<List<Bid>>(
                        stream: _bidService.getBidStream(widget.productId),
                        builder: (context, bidSnapshot) {
                          if (!bidSnapshot.hasData) {
                            return const Center(child: CircularProgressIndicator());
                          }
                          final bids = bidSnapshot.data!;
                          if (bids.isEmpty) {
                            return const Center(child: Text('Aún no hay pujas', style: TextStyle(color: Colors.white54)));
                          }
                          return ListView.builder(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            itemCount: bids.length,
                            itemBuilder: (context, index) {
                              final bid = bids[index];
                              return ListTile(
                                leading: const CircleAvatar(child: Icon(Icons.person)),
                                title: Text(bid.userName ?? 'Usuario', style: const TextStyle(color: Colors.white)),
                                subtitle: Text(bid.createdAt.toLocal().toString(), style: const TextStyle(color: Colors.white54)),
                                trailing: Text('\$${bid.amount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                              );
                            },
                          );
                        },
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    // Bidding UI
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        children: [
                          TextField(
                            controller: _bidController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Tu oferta',
                              hintStyle: const TextStyle(color: Colors.white54),
                              filled: true,
                              fillColor: Colors.white10,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              prefixIcon: const Icon(Icons.monetization_on, color: Colors.greenAccent),
                            ),
                          ),
                          const SizedBox(height: 15),
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: () => _placeBid(product.currentBid),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blueAccent,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Realizar Oferta', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _infoCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.blueAccent, size: 24),
          const SizedBox(height: 5),
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _formatDuration(DateTime endsAt) {
    final diff = endsAt.difference(DateTime.now());
    if (diff.isNegative) return 'Cerrado';
    return '${diff.inDays}d ${diff.inHours % 24}h';
  }
}
