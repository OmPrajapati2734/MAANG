# 🔧 Fixed Admin Setup Instructions

## The Issue
The admin login problem was caused by database schema inconsistencies and missing migrations. This has been fixed with a complete schema rebuild.

## Step 1: Reset Database Schema

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the complete schema migration** (this will be applied automatically)

## Step 2: Create Your First Admin

### Option A: Sign Up First, Then Grant Admin (Recommended)

1. **Sign up normally** through the app with your desired admin email
2. **Go to Supabase Dashboard → SQL Editor**
3. **Run this query** (replace with your email):

```sql
SELECT public.make_user_admin('your-email@example.com', 'super_admin');
```

### Option B: Direct Database Insert

1. **Sign up normally** first
2. **Go to Table Editor → admin_users**
3. **Insert a new row**:
   - **id**: Copy from profiles table
   - **email**: Your email
   - **full_name**: Your name
   - **role**: `super_admin`

## Step 3: Test Admin Access

1. **Logout and login again**
2. **Look for "Admin Panel" in the header**
3. **Click it to access admin features**

## What Was Fixed

✅ **Complete Schema Rebuild** - All tables properly created  
✅ **Fixed RLS Policies** - Proper security permissions  
✅ **Admin Helper Functions** - `is_admin()` and `is_super_admin()`  
✅ **Proper Triggers** - Auto-create profiles on signup  
✅ **Sample Data** - Questions and resources pre-loaded  

## Troubleshooting

If admin login still doesn't work:

1. **Check browser console** for any JavaScript errors
2. **Verify in Supabase**:
   - Check `profiles` table has your user
   - Check `admin_users` table has your entry
   - Ensure IDs match between tables
3. **Clear browser cache** and try again

## Creating More Admins

Once you're a super admin:

```sql
-- Make someone a content admin
SELECT public.make_user_admin('user@example.com', 'content_admin');

-- Make someone a super admin
SELECT public.make_user_admin('user@example.com', 'super_admin');
```

The system should now work perfectly! 🚀