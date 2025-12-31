
-- ============================================
-- La Ganga Phone RD - Database Setup Script
-- ============================================
-- This script sets up the complete database schema for the auction platform
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Products Table (Auction Items)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    specs TEXT,
    current_bid DECIMAL NOT NULL DEFAULT 0,
    reserve_price DECIMAL,
    image_details TEXT,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Extended User Info)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vip')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
    avatar_seed TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outbid_notifications BOOLEAN DEFAULT true,
    auction_ending_notifications BOOLEAN DEFAULT true,
    new_product_notifications BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL NOT NULL, -- Price at time of purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_ends_at ON products(ends_at);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Bids indexes
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update current_bid when a new bid is placed
CREATE OR REPLACE FUNCTION update_current_bid()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET current_bid = NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to close expired auctions
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void AS $$
BEGIN
    UPDATE products
    SET status = 'closed',
        updated_at = NOW()
    WHERE status = 'active'
    AND ends_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, avatar_seed)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        NEW.email,
        FLOOR(RANDOM() * 100)::TEXT
    );
    
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update current_bid on new bid
DROP TRIGGER IF EXISTS on_new_bid ON bids;
CREATE TRIGGER on_new_bid
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_current_bid();

-- Trigger to update updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies
-- Anyone can view active products
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (status = 'active' OR status = 'closed');

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update products
CREATE POLICY "Admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Bids Policies
-- Anyone can view bids
CREATE POLICY "Bids are viewable by everyone"
    ON bids FOR SELECT
    USING (true);

-- Authenticated users can insert bids
CREATE POLICY "Authenticated users can place bids"
    ON bids FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles Policies
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Notification Preferences Policies
-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Orders Policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Order Items Policies
-- Users can view their own order items (via order_id check is complex in RLS simple policy, usually handled by join or ensuring order access first. For simplicity: allow view if user created order)
-- A simpler approach for order_items: Allow select if the linked order belongs to user.
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can create order items (usually part of order creation)
CREATE POLICY "Users can create order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================
-- SCHEDULED JOBS (Supabase pg_cron)
-- ============================================

-- Note: You need to enable pg_cron extension in Supabase dashboard
-- Then run this to schedule automatic auction closing every minute:

-- SELECT cron.schedule(
--     'close-expired-auctions',
--     '* * * * *', -- Every minute
--     $$ SELECT close_expired_auctions(); $$
-- );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for products and bids tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE products IS 'Auction items/products';
COMMENT ON TABLE bids IS 'Bid history for all products';
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON TABLE notification_preferences IS 'User notification preferences';
COMMENT ON TABLE orders IS 'User orders';
COMMENT ON TABLE order_items IS 'Items within an order';

COMMENT ON FUNCTION update_current_bid() IS 'Automatically updates product current_bid when new bid is placed';
COMMENT ON FUNCTION close_expired_auctions() IS 'Closes auctions that have passed their end time';
COMMENT ON FUNCTION handle_new_user() IS 'Creates profile and notification preferences for new users';
