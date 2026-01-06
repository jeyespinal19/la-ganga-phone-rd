class Product {
  final String id;
  final String name;
  final String brand;
  final String? specs;
  final double currentBid;
  final double? reservePrice;
  final String? imageDetails;
  final int stock;
  final DateTime? endsAt;
  final String status;

  Product({
    required this.id,
    required this.name,
    required this.brand,
    this.specs,
    required this.currentBid,
    this.reservePrice,
    this.imageDetails,
    required this.stock,
    this.endsAt,
    required this.status,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as String?) ?? '',
      name: (json['name'] as String?) ?? 'Producto sin nombre',
      brand: (json['brand'] as String?) ?? 'Genérico',
      specs: json['specs'] as String?,
      currentBid: double.tryParse(json['current_bid']?.toString() ?? '0') ?? 0.0,
      reservePrice: double.tryParse(json['reserve_price']?.toString() ?? ''),
      imageDetails: json['image_details'] as String?,
      stock: int.tryParse(json['stock']?.toString() ?? '0') ?? 0,
      endsAt: json['ends_at'] != null ? DateTime.tryParse(json['ends_at'] as String) : null,
      status: (json['status'] as String?) ?? 'active',
    );
  }
}
