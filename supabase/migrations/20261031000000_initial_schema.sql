-- ==============================================================================
-- HOMIE DRIVES — PHASE 2 INITIAL DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Customer & User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    digilocker_dl_number TEXT,
    digilocker_verified BOOLEAN DEFAULT FALSE,
    digilocker_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Roles (Customer, Agent, Master Admin)
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('customer', 'agent', 'master_admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profile_id, role)
);

-- 4. Delhi NCR Operational Pickup & Return Hubs
CREATE TABLE IF NOT EXISTS public.pickup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL DEFAULT 'Delhi NCR',
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Field Agents
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    hub_id UUID NOT NULL REFERENCES public.pickup_locations(id) ON DELETE RESTRICT,
    badge_number TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fleet Vehicles
DO $$ BEGIN
    CREATE TYPE vehicle_status_type AS ENUM ('active', 'maintenance', 'decommissioned');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES public.pickup_locations(id) ON DELETE RESTRICT,
    vin TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    year INT NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    seats INT NOT NULL,
    base_daily_price_inr INT NOT NULL,
    security_deposit_inr INT NOT NULL,
    odometer_km INT NOT NULL DEFAULT 0,
    operational_status vehicle_status_type NOT NULL DEFAULT 'active',
    is_available_for_booking BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Vehicle-to-Agent Assignment History
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    notes TEXT
);

-- 8. Booking & Reservation State Machine
DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM (
        'pending_pickup',
        'verified_handover',
        'active_rental',
        'returned_inspected',
        'closed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    pickup_hub_id UUID NOT NULL REFERENCES public.pickup_locations(id) ON DELETE RESTRICT,
    condition_tier TEXT NOT NULL CHECK (condition_tier IN ('pristine', 'mint', 'touring')),
    rental_period TSTZRANGE NOT NULL,
    pickup_time TIMESTAMPTZ NOT NULL,
    return_time TIMESTAMPTZ NOT NULL,
    daily_rate_inr INT NOT NULL,
    total_amount_inr INT NOT NULL,
    security_deposit_inr INT NOT NULL,
    damage_protection_tier TEXT NOT NULL DEFAULT 'standard',
    fastag_buffer_inr INT NOT NULL DEFAULT 0,
    status booking_status_type NOT NULL DEFAULT 'pending_pickup',
    pickup_otp_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Concurrency Protection: Prevents overlapping vehicle reservations
    EXCLUDE USING gist (vehicle_id WITH =, rental_period WITH &&)
    WHERE (status NOT IN ('cancelled', 'closed'))
);

-- 9. Vehicle Handover & Return Video Inspections
DO $$ BEGIN
    CREATE TYPE inspection_type AS ENUM ('pre_handover', 'return');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.rental_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    type inspection_type NOT NULL,
    odometer_reading INT NOT NULL,
    fuel_or_battery_percent INT NOT NULL,
    inspection_video_path TEXT NOT NULL,
    passed_sanitization BOOLEAN DEFAULT TRUE,
    damage_notes TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Immutable Audit Logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    payload JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Pickup Locations: Public read
CREATE POLICY "Public can view active hubs" ON public.pickup_locations
    FOR SELECT USING (is_active = TRUE);

-- Vehicles: Public can view active vehicles
CREATE POLICY "Public can view active fleet" ON public.vehicles
    FOR SELECT USING (operational_status = 'active');

-- Bookings: Customers can view only their own bookings
CREATE POLICY "Customers view own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

