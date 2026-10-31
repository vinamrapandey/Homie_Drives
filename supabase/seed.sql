-- ==============================================================================
-- HOMIE DRIVES — SEED DATA (DELHI NCR HUBS & FLEET)
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

