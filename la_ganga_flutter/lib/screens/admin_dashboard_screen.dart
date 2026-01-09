import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import '../services/profile_service.dart';
import 'dart:typed_data';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  final ProductService _productService = ProductService();
  final ProfileService _profileService = ProfileService();
  final ImagePicker _picker = ImagePicker();
  
  late TabController _tabController;
  final bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F2027),
      appBar: AppBar(
        title: const Text('Panel de Control', style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF22C55E),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white38,
          tabs: const [
            Tab(icon: Icon(Icons.inventory_2_outlined), text: 'Inventario'),
            Tab(icon: Icon(Icons.shopping_bag_outlined), text: 'Todos los Pedidos'),
          ],
        ),
      ),
      floatingActionButton: _tabController.index == 0 ? FloatingActionButton(
        onPressed: () => _showProductForm(),
        backgroundColor: const Color(0xFF22C55E),
        child: const Icon(Icons.add, color: Colors.white),
      ) : null,
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInventoryTab(),
          _buildOrdersTab(),
        ],
      ),
    );
  }

  Widget _buildInventoryTab() {
    return FutureBuilder<List<Product>>(
      future: _productService.fetchAll(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        final products = snapshot.data ?? [];
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: products.length,
          itemBuilder: (context, index) {
            final p = products[index];
            return _buildProductItem(p);
          },
        );
      },
    );
  }

  Widget _buildOrdersTab() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _profileService.getAllOrders(), // I need to add this method
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        final orders = snapshot.data ?? [];
        if (orders.isEmpty) return const Center(child: Text('Sin pedidos registrados', style: TextStyle(color: Colors.white38)));
        
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: orders.length,
          itemBuilder: (context, index) {
            final order = orders[index];
            return _buildOrderItem(order);
          },
        );
      },
    );
  }

  Widget _buildProductItem(Product p) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white10),
      ),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 50, height: 50, color: Colors.white10,
            child: p.imageUrl.startsWith('http') ? Image.network(p.imageUrl, fit: BoxFit.cover) : const Icon(Icons.image, color: Colors.white24),
          ),
        ),
        title: Text(p.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('\$${p.price}', style: const TextStyle(color: Color(0xFF22C55E))),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(icon: const Icon(Icons.edit_outlined, color: Colors.white70), onPressed: () => _showProductForm(product: p)),
            IconButton(icon: const Icon(Icons.delete_outline, color: Colors.redAccent), onPressed: () => _confirmDelete(p)),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderItem(Map<String, dynamic> order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Pedido #${order['id'].toString().substring(0, 8)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              Text('\$${order['total']}', style: const TextStyle(color: Color(0xFF22C55E), fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          const SizedBox(height: 8),
          Text('Cliente ID: ${order['user_id']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
          const Divider(color: Colors.white10, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatusBadge(order['status']),
              DropdownButton<String>(
                dropdownColor: const Color(0xFF1a1a1a),
                value: order['status'],
                style: const TextStyle(color: Colors.white, fontSize: 12),
                underline: const SizedBox(),
                items: ['pending', 'paid', 'shipped', 'delivered'].map((s) => DropdownMenuItem(value: s, child: Text(s.toUpperCase()))).toList(),
                onChanged: (newStatus) async {
                  if (newStatus != null) {
                    await _profileService.updateOrderStatus(order['id'], newStatus); // I need to add this
                    setState(() {});
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.amber;
    if (status == 'paid') color = Colors.green;
    if (status == 'shipped') color = Colors.blue;
    if (status == 'delivered') color = Colors.purple;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.5))),
      child: Text(status.toUpperCase(), style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  // --- Reuse existing form logic with minor updates ---

  void _confirmDelete(Product product) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a1a),
        title: const Text('¿Eliminar?', style: TextStyle(color: Colors.white)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          TextButton(onPressed: () async {
            await _productService.delete(product.id);
            Navigator.pop(ctx);
            setState(() {});
          }, child: const Text('Eliminar', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
  }

  void _showProductForm({Product? product}) {
    final nameController = TextEditingController(text: product?.name ?? '');
    final brandController = TextEditingController(text: product?.brand ?? '');
    final priceController = TextEditingController(text: product?.price.toString() ?? '');
    final stockController = TextEditingController(text: product?.stock.toString() ?? '1');
    final specsController = TextEditingController(text: product?.specs ?? '');
    String currentImageUrl = product?.imageDetails ?? '';
    Uint8List? selectedImageBytes;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1a1a1a),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField(nameController, 'Nombre'),
                _buildTextField(brandController, 'Marca'),
                _buildTextField(priceController, 'Precio', isNumber: true),
                _buildTextField(stockController, 'Stock', isNumber: true),
                _buildTextField(specsController, 'Specs', maxLines: 3),
                ElevatedButton(
                  onPressed: () async {
                    String imageUrl = currentImageUrl;
                    final data = {
                      'name': nameController.text,
                      'brand': brandController.text,
                      'price': double.tryParse(priceController.text) ?? 0,
                      'stock': int.tryParse(stockController.text) ?? 0,
                      'specs': specsController.text,
                      'image_details': imageUrl,
                    };
                    if (product == null) {
                      await _productService.create(data);
                    } else {
                      await _productService.update(product.id, data);
                    }
                    Navigator.pop(ctx);
                    setState(() {});
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF22C55E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Guardar'),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, {bool isNumber = false, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        maxLines: maxLines,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white38),
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        ),
      ),
    );
  }
}
