import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/product.dart';
import '../services/banner_service.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../widgets/shimmer_skeletons.dart';
import '../supabase/config.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'Todos';
  
  final List<String> _categories = [
    'Todos', 'Oukitel', 'Samsung', 'Xiaomi', 'Hogar', 'Mascotas'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
          ),
        ),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 160,
              floating: true,
              pinned: true,
              backgroundColor: const Color(0xFF0F2027),
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                title: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4ADE80),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.phone_android,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'La Ganga Phone',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF4ADE80),
                      ),
                    ),
                  ],
                ),
                centerTitle: false,
                titlePadding: const EdgeInsets.only(left: 20, bottom: 60),
                background: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      child: Container(
                        height: 45,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: TextField(
                          onChanged: (val) => setState(() => _searchQuery = val),
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            prefixIcon: Icon(Icons.search, color: Colors.white54),
                            hintText: 'Buscar productos...',
                            hintStyle: TextStyle(color: Colors.white38),
                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 50),
                  ],
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.person_outline),
                  onPressed: () => context.push('/profile'),
                ),
                Consumer<CartProvider>(
                  builder: (context, cart, child) {
                    return Stack(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.shopping_cart_outlined),
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
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 50,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = _selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 5),
                      child: ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) setState(() => _selectedCategory = cat);
                        },
                        selectedColor: const Color(0xFF22C55E),
                        backgroundColor: Colors.white10,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.white70,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: StreamBuilder<List<Map<String, dynamic>>>(
                stream: BannerService().streamBanners(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) return const BannerSkeleton();
                  final banners = snapshot.data ?? [];
                  if (banners.isEmpty) return const SizedBox.shrink();
                  return Container(
                    height: 180,
                    margin: const EdgeInsets.symmetric(vertical: 20),
                    child: PageView.builder(
                      itemCount: banners.length,
                      itemBuilder: (context, index) {
                        final b = banners[index];
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 20),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            image: DecorationImage(
                              image: NetworkImage(b['image_url']),
                              fit: BoxFit.cover,
                            ),
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [Colors.black.withValues(alpha: 0.8), Colors.transparent],
                              ),
                            ),
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (b['badge'] != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.yellow,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      b['badge'],
                                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                                    ),
                                  ),
                                const SizedBox(height: 8),
                                Text(
                                  b['title'] ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  b['subtitle'] ?? '',
                                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Productos Destacados', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 5),
                    Text('Encuentra las mejores ofertas en $_selectedCategory', style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: StreamBuilder<List<Map<String, dynamic>>>(
                stream: SupabaseConfig.client.from('products').stream(primaryKey: ['id']).order('created_at'),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.7,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 15,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => const ProductSkeleton(),
                        childCount: 4,
                      ),
                    );
                  }
                  if (snapshot.hasError) {
                    return SliverToBoxAdapter(child: Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.white))));
                  }
                  
                  final allProducts = (snapshot.data ?? []).map((e) => Product.fromJson(e)).toList();
                  
                  var products = allProducts;
                  if (_selectedCategory != 'Todos') {
                    products = allProducts.where((p) => p.brand.toLowerCase() == _selectedCategory.toLowerCase()).toList();
                  }

                  if (_searchQuery.isNotEmpty) {
                    products = products.where((p) => p.name.toLowerCase().contains(_searchQuery.toLowerCase())).toList();
                  }

                  if (products.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Center(child: Text('No hay productos disponibles', style: TextStyle(color: Colors.white70))),
                    );
                  }

                  return SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildProductCard(context, products[index]),
                      childCount: products.length,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Product product) {
    return InkWell(
      onTap: () => context.push('/product/${product.id}'),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: product.imageUrl.startsWith('http') 
                      ? Image.network(
                          product.imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Icon(Icons.phone_iphone, size: 50, color: Colors.white24),
                        )
                      : const Icon(Icons.phone_iphone, size: 50, color: Colors.white24),
                  ),
                  if (product.stock <= 0)
                    Container(
                      color: Colors.black45,
                      child: const Center(
                        child: Text('AGOTADO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product.brand,
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '\$${product.price.toStringAsFixed(0)}',
                            style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 17),
                          ),
                          if (product.originalPrice != null)
                            Text(
                              '\$${product.originalPrice!.toStringAsFixed(0)}',
                              style: const TextStyle(color: Colors.white30, fontSize: 11, decoration: TextDecoration.lineThrough),
                            ),
                        ],
                      ),
                      InkWell(
                        onTap: () {
                          context.read<CartProvider>().addItem(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product.name} añadido al carrito'),
                              duration: const Duration(seconds: 1),
                              backgroundColor: const Color(0xFF22C55E),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF22C55E).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add_shopping_cart, size: 16, color: Color(0xFF22C55E)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
