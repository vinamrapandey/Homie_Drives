-- ==============================================================================
-- HOMIE DRIVES — PHASE 3 PRODUCTION SCHEMA & STORAGE MIGRATION
-- Target Database: Supabase PostgreSQL
-- Includes: KYC Dossiers, Digital Contracts, Escrow Settlements, Private Storage Buckets & RLS
-- ==============================================================================

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Extend Existing Agents Table with employee_code
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'employee_code'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN employee_code TEXT UNIQUE;
        -- Populate employee_code from badge_number if empty
        UPDATE public.agents SET employee_code = badge_number WHERE employee_code IS NULL;
    END IF;
END $$;

-- 3. Extend Existing Bookings Table with Subscription Fields
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'plan_type'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN plan_type TEXT DEFAULT 'daily';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'is_subscription'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN is_subscription BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'next_service_due_date'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN next_service_due_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'monthly_renewal_date'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN monthly_renewal_date DATE;
    END IF;
END $$;

-- 4. Customer KYC & Identity Dossiers (DigiLocker & MoRTH Sarathi)
DO $$ BEGIN
    CREATE TYPE kyc_status_type AS ENUM ('verified', 'pending_review', 'flagged', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_risk_level_type AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.customer_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    masked_aadhaar TEXT NOT NULL,
    dl_number TEXT NOT NULL,
    issuing_rto TEXT,
    vehicle_classes TEXT[] DEFAULT ARRAY['LMV-NT'],
    status kyc_status_type NOT NULL DEFAULT 'pending_review',
    risk_level kyc_risk_level_type NOT NULL DEFAULT 'low',
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    document_url TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_kyc_user_id ON public.customer_kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_kyc_status ON public.customer_kyc(status);

-- 5. Digital Rental Contracts & Cryptographic Audit Trails
DO $$ BEGIN
    CREATE TYPE contract_status_type AS ENUM ('signed', 'countersigned', 'disputed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE NOT NULL,
    booking_ref TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    masked_aadhaar TEXT NOT NULL,
    dl_number TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    hub_name TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_days INT NOT NULL,
    daily_rate_inr INT NOT NULL,
    deposit_held_inr INT NOT NULL,
    total_amount_inr INT NOT NULL,
    terms_version TEXT NOT NULL DEFAULT 'Homie-Master-Rental-Agreement-v2.4-NCR',
    customer_signature_svg TEXT NOT NULL,
    countersigned_by_admin BOOLEAN DEFAULT FALSE,
    admin_signature_svg TEXT,
    admin_signer_name TEXT,
    status contract_status_type NOT NULL DEFAULT 'signed',
    document_hash_sha256 TEXT NOT NULL,
    ip_address TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    countersigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rental_contracts_booking_ref ON public.rental_contracts(booking_ref);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_customer_email ON public.rental_contracts(customer_email);

-- 6. Escrow Deposit Settlements & FASTag Toll Deductions
DO $$ BEGIN
    CREATE TYPE settlement_status_type AS ENUM (
        'held_in_escrow',
        'refund_dispatched',
        'disputed_hold',
        'settlement_pending'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    vehicle_registration TEXT NOT NULL,
    hub_name TEXT NOT NULL,
    pickup_date TEXT NOT NULL,
    return_date TEXT NOT NULL,
    deposit_held_inr INT NOT NULL,
    fastag_tolls_inr INT NOT NULL DEFAULT 0,
    toll_plazas JSONB DEFAULT '[]'::jsonb,
    excess_km INT NOT NULL DEFAULT 0,
    excess_km_rate_inr INT NOT NULL DEFAULT 15,
    excess_km_charges_inr INT NOT NULL DEFAULT 0,
    damage_cleaning_charges_inr INT NOT NULL DEFAULT 0,
    damage_reason TEXT,
    total_deductions_inr INT NOT NULL DEFAULT 0,
    net_refund_inr INT NOT NULL DEFAULT 0,
    zero_floor_applied BOOLEAN DEFAULT FALSE,
    status settlement_status_type NOT NULL DEFAULT 'held_in_escrow',
    payment_gateway_ref TEXT,
    settled_at TIMESTAMPTZ,
    settled_by TEXT,
    settlement_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_booking_ref ON public.settlements(booking_ref);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);

-- ==============================================================================
-- 7. HELPER SECURITY FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = auth.uid() AND role = 'master_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = auth.uid() AND role = 'agent'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_agent_hub_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT hub_id FROM public.agents
  WHERE profile_id = auth.uid() AND is_active = TRUE
  LIMIT 1;
$$;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on newly created tables
ALTER TABLE public.customer_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- 8.1. customer_kyc Policies
DROP POLICY IF EXISTS "Customers can view own kyc" ON public.customer_kyc;
CREATE POLICY "Customers can view own kyc" ON public.customer_kyc
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Customers can create own kyc" ON public.customer_kyc;
CREATE POLICY "Customers can create own kyc" ON public.customer_kyc
    FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update kyc" ON public.customer_kyc;
CREATE POLICY "Admins can update kyc" ON public.customer_kyc
    FOR UPDATE USING (public.is_admin());

-- 8.2. rental_contracts Policies
DROP POLICY IF EXISTS "Users can view own contracts" ON public.rental_contracts;
CREATE POLICY "Users can view own contracts" ON public.rental_contracts
    FOR SELECT USING (
        public.is_admin() OR 
        customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can insert contracts" ON public.rental_contracts;
CREATE POLICY "Authenticated users can insert contracts" ON public.rental_contracts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update contracts" ON public.rental_contracts;
CREATE POLICY "Admins can update contracts" ON public.rental_contracts
    FOR UPDATE USING (public.is_admin());

-- 8.3. settlements Policies
DROP POLICY IF EXISTS "Users and Agents can view settlements" ON public.settlements;
CREATE POLICY "Users and Agents can view settlements" ON public.settlements
    FOR SELECT USING (
        public.is_admin() OR
        public.is_agent() OR
        customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Staff can manage settlements" ON public.settlements;
CREATE POLICY "Staff can manage settlements" ON public.settlements
    FOR ALL USING (public.is_admin() OR public.is_agent());

-- 8.4. Extended Policies for Existing Tables
DROP POLICY IF EXISTS "Admins full access on vehicles" ON public.vehicles;
CREATE POLICY "Admins full access on vehicles" ON public.vehicles
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Agents can update vehicle odometer during return" ON public.vehicles;
CREATE POLICY "Agents can update vehicle odometer during return" ON public.vehicles
    FOR UPDATE USING (public.is_agent() AND hub_id = public.get_agent_hub_id());

DROP POLICY IF EXISTS "Admins full access on bookings" ON public.bookings;
CREATE POLICY "Admins full access on bookings" ON public.bookings
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Agents view and update hub bookings" ON public.bookings;
CREATE POLICY "Agents view and update hub bookings" ON public.bookings
    FOR ALL USING (public.is_agent() AND pickup_hub_id = public.get_agent_hub_id());

DROP POLICY IF EXISTS "Agents and Admins can create inspections" ON public.rental_inspections;
CREATE POLICY "Agents and Admins can create inspections" ON public.rental_inspections
    FOR INSERT WITH CHECK (public.is_agent() OR public.is_admin());

DROP POLICY IF EXISTS "Customers and Staff can view inspections" ON public.rental_inspections;
CREATE POLICY "Customers and Staff can view inspections" ON public.rental_inspections
    FOR SELECT USING (
        public.is_admin() OR
        public.is_agent() OR
        booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKETS CONFIGURATION (PRIVATE)
-- ==============================================================================

-- 9.1. Create Private Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'inspections',
        'inspections',
        FALSE,
        52428800, -- 50 MB max per walk-around video
        ARRAY['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png']
    ),
    (
        'kyc-documents',
        'kyc-documents',
        FALSE,
        10485760, -- 10 MB max per DL/Aadhaar document
        ARRAY['image/jpeg', 'image/png', 'application/pdf']
    )
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9.2. Storage RLS Policies for 'inspections' Bucket
DROP POLICY IF EXISTS "Agents and Admins can upload inspection videos" ON storage.objects;
CREATE POLICY "Agents and Admins can upload inspection videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'inspections' AND (
        public.is_admin() OR public.is_agent()
    )
);

DROP POLICY IF EXISTS "Authenticated users can view inspection media" ON storage.objects;
CREATE POLICY "Authenticated users can view inspection media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'inspections'
);

-- 9.3. Storage RLS Policies for 'kyc-documents' Bucket
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents' AND (
        public.is_admin() OR (auth.uid()::text = (storage.foldername(name))[1])
    )
);

DROP POLICY IF EXISTS "Users view own KYC and Admins view all KYC" ON storage.objects;
CREATE POLICY "Users view own KYC and Admins view all KYC"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND (
        public.is_admin() OR (auth.uid()::text = (storage.foldername(name))[1])
    )
);
