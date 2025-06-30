# Admin User Setup Instructions

## How to Make a User an Admin

### Step 1: Create a Regular Account First
1. Go to your app and sign up with the email you want to make admin
2. Complete the normal registration process
3. Note down the email address you used

### Step 2: Get the User ID
After signing up, you can find the user ID in two ways:

**Option A: From Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Find your user and copy the UUID

**Option B: From Browser Console**
1. Login to your app
2. Open browser developer tools (F12)
3. Go to Console tab
4. Type: `console.log(JSON.parse(localStorage.getItem('sb-[your-project-ref]-auth-token')).user.id)`
5. Copy the UUID that appears

### Step 3: Add User to Admin Table
Go to your Supabase project dashboard:

1. Navigate to SQL Editor
2. Run this query (replace the values with your actual data):

```sql
INSERT INTO admin_users (id, email, full_name, role)
VALUES (
  'your-user-uuid-here',
  'your-email@example.com', 
  'Your Full Name',
  'super_admin'  -- or 'content_admin'
);
```

### Step 4: Test Admin Access
1. Refresh your app or logout and login again
2. You should now see "MAANG Admin" in the header instead of "MAANG Prep"
3. You can access admin routes like `/admin`

## Admin Roles

### Content Admin (`content_admin`)
- Can manage questions and resources
- Can view analytics
- Cannot manage other admin users

### Super Admin (`super_admin`) 
- All content admin permissions
- Can manage other admin users
- Can access admin settings
- Has full system access

## Admin vs User Login

**Same Login Process**: Both admins and regular users use the same login form and authentication system.

**Different Experience After Login**:
- **Regular Users**: See the normal header and can access `/dashboard`, `/practice`, `/mentor`
- **Admin Users**: See the admin header when on admin routes, can access both user portal AND admin panel

## Accessing Admin Panel

Once you're an admin:
- Go to `/admin` to access the admin dashboard
- The header will automatically switch to admin mode
- You can switch back to user portal anytime by clicking "User Portal" in the header

## Security Notes

- Admin status is checked on every request using Row Level Security (RLS)
- Admin routes are protected and will redirect non-admins to the dashboard
- Super admin routes require super admin role specifically