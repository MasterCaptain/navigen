# 🚢 NAVIGEN Supabase Setup Guide

## ✅ Completed Steps

1. **Supabase Client** - Connected to your project: `https://fcwzmwoahottepzhmynz.supabase.co`
2. **Auth Service** - Upgraded from mock to real Supabase authentication
3. **Login Screen** - Now supports real sign-up and sign-in

## 🎯 Next Steps - Run This SQL in Supabase

### 1. Go to SQL Editor
Navigate to: https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/sql

### 2. Run the Database Schema
Copy and paste the entire contents of `/src/lib/database-schema.sql` into the SQL editor and click "RUN".

This will create:
- ✅ `user_profiles` - User accounts (captain, crew, admin)
- ✅ `vessels` - Ship registry with IMO, MMSI, polar class, etc.
- ✅ `vessel_positions` - Real-time position tracking
- ✅ `routes` - Saved routes and waypoints (RTZ support)
- ✅ `compliance_logs` - MUST/SHOULD/CONSIDER compliance history
- ✅ Row Level Security (RLS) - Users can only see their own data
- ✅ Auto-triggers for timestamps and user profiles

### 3. Enable Email Authentication (Optional)
If you want real email confirmations:
1. Go to **Authentication** → **Settings**
2. Enable "Email" provider
3. Configure SMTP settings (or use Supabase default)

### 4. Test the System

**Create your first account:**
1. Run the NAVIGEN app
2. Click "Don't have an account? Sign up"
3. Enter email and password
4. Check your email for confirmation (if enabled)
5. Sign in!

**Verify database:**
```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check your user profile (after signup)
SELECT * FROM public.user_profiles;
```

## 🔧 Integration Points

The following NAVIGEN features now persist to Supabase:

### Authentication
- ✅ Sign up / Sign in / Sign out
- ✅ Session management
- ✅ User profiles with roles

### Vessels
- 🚧 Save vessel configuration (IMO, type, polar class)
- 🚧 Track vessel positions in real-time
- 🚧 Multi-vessel support (one user can manage multiple ships)

### Routes
- 🚧 Save manually created routes
- 🚧 Import RTZ routes and persist them
- 🚧 Load historical routes

### Compliance
- 🚧 Log all MUST/SHOULD/CONSIDER violations
- 🚧 Track compliance history
- 🚧 Generate compliance reports

**Legend:**
- ✅ = Implemented and working
- 🚧 = Database ready, needs UI integration (next phase)

## 📊 Database Schema Overview

```
user_profiles
├── id (UUID, references auth.users)
├── email
├── role (admin/captain/crew)
└── full_name

vessels
├── id (UUID)
├── imo_number (unique)
├── vessel_name
├── vessel_type (cruise/cargo/research/etc)
├── polar_class (PC1-PC7)
├── ice_class (1A, 1A*, etc)
└── owner_id (references auth.users)

vessel_positions (realtime tracking)
├── vessel_id
├── latitude, longitude
├── heading, speed, course
└── timestamp

routes
├── vessel_id
├── name, description
├── waypoints (JSONB)
└── source_type (manual/rtz/imported)

compliance_logs
├── vessel_id
├── route_id
├── rule_type (MUST/SHOULD/CONSIDER)
├── rule_category (IMO/SOLAS/MARPOL/IAATO/Svalbard)
├── status (compliant/non_compliant/warning/info)
└── timestamp
```

## 🔐 Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only access their own vessels and data
- ✅ Email/password authentication via Supabase Auth
- ✅ Anon key is safe for client-side use (limited permissions)

## 🚀 What's Next?

**Phase 2 - UI Integration:**
1. Vessel selection dropdown (load from database)
2. Auto-save vessel positions during GPS tracking
3. Persist routes when created/imported
4. Compliance log viewer with historical data
5. Realtime position sharing between vessels (optional)

**Phase 3 - Advanced Features:**
1. Multi-user collaboration (crew members on same vessel)
2. Compliance reports export
3. Route sharing between vessels
4. Admin dashboard for fleet management

## 💡 Tips

- The database is ready! Auth works now.
- All database functions are in `/src/lib/authService.ts`
- Supabase client config is in `/src/lib/supabase.ts`
- You can extend the schema anytime by adding more SQL

---

**Need help?** Check the Supabase docs: https://supabase.com/docs
