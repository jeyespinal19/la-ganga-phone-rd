-- ============================================
-- La Ganga Phone RD - Seed Data
-- ============================================
-- This script populates the database with sample data for development
-- Run this AFTER setup.sql

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================

INSERT INTO products (name, brand, specs, current_bid, reserve_price, image_details, ends_at, status) VALUES
('Oukitel WP300 5G', 'Oukitel', '12GB/512GB', 20000, 25000, 'rugged-phone-1', NOW() + INTERVAL '12 days 3 hours', 'active'),
('Oukitel WP100 12GB', 'Oukitel', 'de RAM y 512GB', 36500, 42000, 'rugged-phone-2', NOW() + INTERVAL '19 days 4 hours', 'active'),
('Oukitel WP56 5G', 'Oukitel', '12GB/512GB', 18500, 22000, 'rugged-phone-3', NOW() + INTERVAL '14 days 23 hours', 'active'),
('Oukitel G3 4GB/128GB', 'Oukitel', '', 7700, 9500, 'rugged-phone-4', NOW() + INTERVAL '11 days 5 hours', 'active'),
('Oukitel WP210 5G', 'Oukitel', '12GB/512GB', 600, 2500, 'rugged-phone-5', NOW() + INTERVAL '9 days 4 hours', 'active'),
('Oukitel G5 4GB/64GB', 'Oukitel', 'Movil Rugerizado', 7700, 9000, 'rugged-phone-6', NOW() + INTERVAL '6 days 3 hours', 'active'),
('Oukitel WP55 Ultra 5G', 'Oukitel', '12 GB de RAM 512 GB', 16000, 19500, 'rugged-phone-7', NOW() + INTERVAL '5 days 3 hours', 'active'),
('Oukitel C62 5G', 'Oukitel', '16GB/512GB', 7700, 11000, 'rugged-phone-8', NOW() + INTERVAL '23 minutes', 'active'),
('Samsung Galaxy A54', 'Samsung', '8GB/256GB, 5G', 15000, 18000, 'samsung-phone-1', NOW() + INTERVAL '8 days', 'active'),
('Samsung Galaxy S23', 'Samsung', '12GB/512GB, Snapdragon 8 Gen 2', 35000, 42000, 'samsung-phone-2', NOW() + INTERVAL '15 days', 'active'),
('Xiaomi Redmi Note 13', 'Xiaomi', '8GB/256GB, MediaTek', 12000, 15000, 'xiaomi-phone-1', NOW() + INTERVAL '10 days', 'active'),
('Xiaomi 13T Pro', 'Xiaomi', '12GB/512GB, Dimensity 9200+', 28000, 33000, 'xiaomi-phone-2', NOW() + INTERVAL '7 days', 'active');

-- ============================================
-- SAMPLE ADMIN USER
-- ============================================
-- Note: You need to create this user through Supabase Auth first
-- Then update the profile to make them admin

-- Example: After creating user through Supabase Auth UI or API
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@lagangaphone.com';

-- ============================================
-- SAMPLE BIDS (Optional - for testing)
-- ============================================
-- Note: These require actual user IDs from auth.users
-- Uncomment and replace with real UUIDs after creating test users

-- INSERT INTO bids (product_id, user_id, user_name, amount) VALUES
-- ((SELECT id FROM products WHERE name = 'Oukitel WP300 5G'), 'user-uuid-here', 'Carlos Rodriguez', 19500),
-- ((SELECT id FROM products WHERE name = 'Oukitel WP300 5G'), 'user-uuid-here', 'Maria Benitez', 20000);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check products were inserted
SELECT COUNT(*) as product_count FROM products;

-- Check triggers are working
SELECT name, current_bid, reserve_price, status FROM products ORDER BY ends_at;

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'bids', 'profiles')
ORDER BY tablename, policyname;
