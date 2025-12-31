# 📚 Database Setup Guide

## Prerequisites
- Supabase project created
- Access to Supabase SQL Editor

## Setup Steps

### 1. Run Setup Script

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `setup.sql`
5. Click **Run** or press `Ctrl+Enter`

This will create:
- ✅ All tables (products, bids, profiles, notification_preferences)
- ✅ Indexes for performance
- ✅ Triggers for automatic updates
- ✅ Row Level Security policies
- ✅ Realtime subscriptions

### 2. Run Seed Data (Optional)

For development/testing:

1. In SQL Editor, create another new query
2. Copy and paste the contents of `seed.sql`
3. Click **Run**

This will populate the database with sample products.

### 3. Create Admin User

**Option A: Through Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. After creation, go to **SQL Editor** and run:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

**Option B: Through Application**
1. Register normally through the app
2. Manually update the role in Supabase:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

### 4. Enable pg_cron (Optional - for auto-closing auctions)

1. Go to **Database** → **Extensions**
2. Search for `pg_cron`
3. Enable it
4. Run in SQL Editor:
   ```sql
   SELECT cron.schedule(
       'close-expired-auctions',
       '* * * * *', -- Every minute
       $$ SELECT close_expired_auctions(); $$
   );
   ```

### 5. Verify Setup

Run these verification queries:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('products', 'bids', 'profiles', 'notification_preferences');

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('products', 'bids', 'profiles', 'notification_preferences');

-- Check sample data
SELECT COUNT(*) as total_products FROM products;
```

## Troubleshooting

### Error: "relation already exists"
- The tables already exist. You can either:
  - Drop them first: `DROP TABLE IF EXISTS table_name CASCADE;`
  - Or skip the setup and just run seed data

### Error: "permission denied"
- Make sure you're running queries as the postgres role
- Check that RLS policies are correctly configured

### Triggers not firing
- Verify triggers exist: `SELECT * FROM information_schema.triggers;`
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'update_current_bid';`

### Realtime not working
- Verify publication: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- Make sure tables are added to publication

## Migration Strategy

For production updates:

1. Create migration files in `supabase/migrations/`
2. Name them with timestamp: `20250101000000_add_feature.sql`
3. Test in staging first
4. Apply to production through Supabase CLI or dashboard

## Backup

Always backup before major changes:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or through dashboard: Database → Backups
```
