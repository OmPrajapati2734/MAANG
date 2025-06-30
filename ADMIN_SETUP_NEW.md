# 🔐 Admin Setup Instructions

## Step 1: Create Your Admin Account

1. **Sign Up Normally**: Go to the app and create a regular account with your desired admin email
2. **Complete Registration**: Fill out the signup form with your details
3. **Note Your Email**: Remember the exact email address you used

## Step 2: Grant Admin Privileges

After signing up, you need to grant admin privileges to your account. You can do this in two ways:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace with your actual email):

```sql
SELECT public.make_user_admin('your-email@example.com', 'super_admin');
```

### Option B: Direct Database Insert

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **admin_users**
3. Click **Insert** → **Insert row**
4. Fill in:
   - **id**: Copy your user ID from the **profiles** table
   - **email**: Your email address
   - **full_name**: Your full name
   - **role**: `super_admin`

## Step 3: Test Admin Access

1. **Refresh the app** or logout and login again
2. You should now see **"Admin Panel"** in the header
3. Click on it to access the admin dashboard

## Admin Roles

- **super_admin**: Full access to everything, can create other admins
- **content_admin**: Can manage questions and resources, cannot create other admins

## Creating Additional Admins

Once you're a super admin:

1. Have the person sign up normally first
2. Use the `make_user_admin()` function with their email
3. They'll have admin access on their next login

## Security Features

✅ **No Automatic Admin Creation** - Prevents unauthorized access  
✅ **Manual Admin Granting** - Full control over who becomes admin  
✅ **Role-Based Access** - Different permission levels  
✅ **Clean User Experience** - No admin hints in signup form  

## Troubleshooting

If you don't see admin features after following these steps:

1. **Check the admin_users table** - Make sure your entry exists
2. **Verify your user ID** - Ensure it matches between profiles and admin_users tables
3. **Clear browser cache** - Sometimes needed for role changes to take effect
4. **Check browser console** - Look for any JavaScript errors

The system is now secure and production-ready! 🚀