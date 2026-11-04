-- ==============================================================================
-- HOMIE DRIVES — SEED DATA (DELHI NCR HUBS, FLEET, PROFILES & ROLES)
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Insert Delhi NCR Operational Hubs
INSERT INTO public.pickup_locations (id, name, slug, city, address, latitude, longitude, is_active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Aerocity Hub (IGI Airport)', 'delhi-aerocity', 'Delhi NCR', 'Hospitality District, Near T3 Terminal, Aerocity, New Delhi 110037', 28.5494, 77.1212, TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Connaught Place Hub', 'delhi-cp', 'Delhi NCR', 'Inner Circle, Block C, Connaught Place, New Delhi 110001', 28.6315, 77.2167, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Cyber Hub DLF Phase 2', 'gurugram-cyberhub', 'Delhi NCR', 'Building 8, DLF Cyber City, DLF Phase 2, Gurugram 122002', 28.4950, 77.0895, TRUE),
    ('a0000000-0000-0000-0000-000000000004', 'Golf Course Road Hub', 'gurugram-golfcourse', 'Delhi NCR', 'Horizon Centre, Golf Course Road, Sector 54, Gurugram 122002', 28.4357, 77.1042, TRUE),
    ('a0000000-0000-0000-0000-000000000005', 'Sector 18 Hub', 'noida-sec18', 'Delhi NCR', 'Sector 18 Commercial Complex, Noida, Uttar Pradesh 201301', 28.5708, 77.3260, TRUE),
    ('a0000000-0000-0000-0000-000000000006', 'Select Citywalk Hub', 'delhi-saket', 'Delhi NCR', 'Press Enclave Marg, Saket District Centre, New Delhi 110017', 28.5284, 77.2195, TRUE)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address;

-- 2. Insert Core Fleet Vehicles
INSERT INTO public.vehicles (
    id, hub_id, vin, registration_number, name, slug, brand, category, year,
    fuel_type, transmission, seats, base_daily_price_inr, security_deposit_inr,
    odometer_km, operational_status, is_available_for_booking
)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003', -- Cyber Hub
        'MA1TR25AX7L982141',
        'DL 01 AB 8924',
        'Mahindra Thar Roxx 4x4 AX7L',
        'mahindra-thar-roxx-4x4',
        'Mahindra',
        'adventure-4x4',
        2025,
        'Diesel',
        'Automatic',
        5,
        4499,
        5000,
        3420,
        'active',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002', -- Connaught Place
        'MATNX25EVLR774120',
        'DL 02 EV 4190',
        'Tata Nexon EV Empowered+ LR',
        'tata-nexon-ev-long-range',
        'Tata',
        'urban-electric',
        2025,
        'Electric',
        'Automatic',
        5,
        2699,
        4000,
        4150,
        'active',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001', -- Aerocity IGI Airport
        'TYTHC25ZXHY881923',
        'DL 01 CX 7721',
        'Toyota Innova HyCross ZX(O) Hybrid',
        'toyota-innova-hycross-zx',
        'Toyota',
        'executive-lounge',
        2025,
        'Hybrid',
        'Automatic',
        7,
        5499,
        10000,
        8200,
        'active',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000003', -- Cyber Hub
        'MASCN25Z8L339182',
        'HR 26 DQ 5519',
        'Mahindra Scorpio-N Z8L 4Xplor',
        'mahindra-scorpio-n-4xplor',
        'Mahindra',
        'adventure-4x4',
        2025,
        'Diesel',
        'Automatic',
        7,
        3899,
        5000,
        12450,
        'active',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001', -- Aerocity IGI Airport
        'SCFED25VAN882104',
        'DL 01 EX 0007',
        'Aston Martin Vantage V8 Coupe',
        'aston-martin-vantage-v8',
        'Aston Martin',
        'supercar',
        2024,
        'Petrol',
        'Automatic',
        2,
        22499,
        25000,
        4200,
        'active',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001', -- Aerocity IGI Airport
        'WBA3S25GLM119284',
        'DL 03 CA 3310',
        'BMW 3-Series Gran Limousine M Sport',
        'bmw-3-series-gran-limousine',
        'BMW',
        'executive-lounge',
        2024,
        'Petrol',
        'Automatic',
        5,
        8499,
        10000,
        15800,
        'active',
        TRUE
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    base_daily_price_inr = EXCLUDED.base_daily_price_inr,
    operational_status = EXCLUDED.operational_status;

-- 3. Insert Operational Agents
-- Note: When users sign up via Supabase Auth, their id maps to public.profiles.
-- The following seed records establish baseline agents linked to hubs.
INSERT INTO public.agents (id, profile_id, hub_id, badge_number, employee_code, is_active)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003', -- Cyber Hub
        'HD-AGT-0102',
        'HD-AGT-CYB-01',
        TRUE
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001', -- Aerocity Hub
        'HD-AGT-0104',
        'HD-AGT-AER-02',
        TRUE
    )
ON CONFLICT (badge_number) DO NOTHING;

-- 4. Sample Digital Contracts
INSERT INTO public.rental_contracts (
    id, contract_number, booking_ref, customer_name, customer_email, customer_phone,
    masked_aadhaar, dl_number, vehicle_name, registration_number, hub_name,
    pickup_date, return_date, total_days, daily_rate_inr, deposit_held_inr, total_amount_inr,
    terms_version, customer_signature_svg, countersigned_by_admin, admin_signature_svg,
    admin_signer_name, status, document_hash_sha256, ip_address, signed_at, countersigned_at
)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'HD-CTR-2026-DEL-0091',
    'HD-DEL-8924',
    'Arjun Sharma',
    'arjun.sharma@example.com',
    '+91 98112 34567',
    'XXXXXXXX8492',
    'DL-04-2018-0091823',
    'Mahindra Thar Roxx 4x4 AX7L',
    'DL 01 AB 8924',
    'Aerocity Hub (IGI Airport)',
    '2026-11-15',
    '2026-11-18',
    3,
    4499,
    5000,
    18497,
    'Homie-Master-Rental-Agreement-v2.4-NCR',
    'M 20 50 Q 50 15, 80 45 T 140 40 Q 180 20, 210 55 T 260 45',
    TRUE,
    'M 30 40 Q 70 65, 120 30 T 190 50 Q 220 20, 270 40',
    'Devansh Singhania (Master Admin)',
    'countersigned',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '122.161.49.204 (Airtel Broadband Delhi)',
    '2026-10-30T10:15:32Z',
    '2026-10-30T11:00:14Z'
)
ON CONFLICT (contract_number) DO NOTHING;

-- 5. Sample Escrow Settlements
INSERT INTO public.settlements (
    id, booking_ref, customer_name, customer_phone, customer_email,
    vehicle_name, vehicle_registration, hub_name, pickup_date, return_date,
    deposit_held_inr, fastag_tolls_inr, toll_plazas, excess_km, excess_km_rate_inr,
    excess_km_charges_inr, damage_cleaning_charges_inr, total_deductions_inr,
    net_refund_inr, zero_floor_applied, status, payment_gateway_ref, settled_at,
    settled_by, settlement_notes, created_at
)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    '#HD-DEL-8924',
    'Arjun Sharma',
    '9811234567',
    'arjun.sharma@example.com',
    'Aston Martin Vantage V8',
    'DL-01-HD-2025',
    'Aerocity Hub (IGI Airport)',
    '14 Nov 2026',
    '17 Nov 2026',
    15000,
    450,
    '[{"plazaName": "Kherki Daula Plaza", "highwayName": "NH-48 Delhi-Jaipur Highway", "timestamp": "15 Nov 2026, 10:14", "tollFeeINR": 85}, {"plazaName": "DND Flyway Entry", "highwayName": "DND Express Corridor", "timestamp": "16 Nov 2026, 17:40", "tollFeeINR": 65}, {"plazaName": "Manesar Toll Plaza", "highwayName": "Western Peripheral Expressway (KMP)", "timestamp": "16 Nov 2026, 19:20", "tollFeeINR": 300}]'::jsonb,
    0,
    35,
    0,
    0,
    450,
    14550,
    FALSE,
    'refund_dispatched',
    'UPI-UTR-20261117-918204',
    '2026-11-17T18:45:00Z',
    'Rohit Verma (Agent HD-AGT-0104)',
    'Pristine return. Odometer delta within daily 300km allowance. FASTag tolls settled via NETC.',
    '2026-11-14T09:00:00Z'
)
ON CONFLICT (booking_ref) DO NOTHING;
