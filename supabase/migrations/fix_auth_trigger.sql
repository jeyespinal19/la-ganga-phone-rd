-- ============================================
-- Fix Authentication Issues Migration (Final)
-- ============================================
-- This migration:
-- 1. Recreates the handle_new_user trigger
-- 2. Manually creates profiles for existing users without profiles
-- 3. Confirms all existing users

-- ============================================
-- STEP 1: Ensure the function exists
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, avatar_seed)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        NEW.email,
        FLOOR(RANDOM() * 100)::TEXT
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Recreate the trigger
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 3: Create profiles for existing users
-- ============================================

-- This will create profiles for any users in auth.users who don't have a profile
INSERT INTO profiles (id, name, email, avatar_seed)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', 'Usuario'),
    au.email,
    FLOOR(RANDOM() * 100)::TEXT
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: Confirm all users (disable email verification)
-- ============================================

-- Update all unconfirmed users to be confirmed
-- This allows them to login immediately
-- Note: confirmed_at is a generated column, so we only update email_confirmed_at
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

COMMENT ON FUNCTION handle_new_user() IS 'Creates profile for new users on signup';
