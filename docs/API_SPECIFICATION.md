# Homie Drives — API & Server Actions Specification

* **Protocol**: Next.js Server Actions & Route Handlers (`src/app/api/`)
* **Validation**: Zod schema validation
* **Authentication**: Supabase JWT / Session Cookie validation

---

## 1. Customer Endpoints & Server Actions

### `POST /api/bookings/quote`
Computes deterministic rental pricing before checkout.
* **Input**:
  ```json
  {
    "vehicleId": "homie-car-01",
    "conditionTier": "pristine",
    "startDate": "2026-11-15T10:00:00Z",
    "endDate": "2026-11-18T18:00:00Z",
    "damageProtectionTier": "zero_dep",
    "fastagBufferINR": 1000
  }
  ```
* **Output**:
  ```json
  {
    "days": 4,
    "baseDailyRate": 4499,
    "adjustedDailyRate": 5174,
    "rentalBase": 20696,
    "damageProtectionFee": 1996,
    "serviceFee": 1035,
    "gst": 3725,
    "securityDeposit": 5000,
    "fastagBuffer": 1000,
    "totalPayableAtPickup": 32452
  }
  ```

### `POST /api/bookings/create`
Submits a reservation request with concurrency protection.
* **Validation**: Checks date range validity, vehicle operational status, and active reservation overlap.
* **Returns**: Active digital pass payload (`bookingRef`, `pinCode`, `qrPayload`, `handoverHub`).

---

## 2. Agent Operations Endpoints (`/api/agent/`)

### `POST /api/agent/verify-otp`
Validates customer pickup OTP and unlocks handover inspection.
* **Payload**: `{ "bookingCode": "HD-DEL-8924", "otp": "8924" }`
* **Response**: `{ "verified": true, "unlockedInspection": true }`

### `POST /api/agent/inspections/upload`
Uploads compulsory 360° walkaround video and records odometer & fuel/battery state.
* **Payload (Multipart)**: `videoFile`, `odometerKm`, `fuelPercent`, `bookingId`, `inspectionType`.
* **Storage Destination**: Private Supabase Bucket `rental-inspections/`.

---

## 3. Master Administration Endpoints (`/api/admin/`)

### `POST /api/admin/fleet/assign`
Assigns or reallocates a vehicle to an operational agent.
* **Payload**: `{ "vehicleId": "...", "agentId": "...", "notes": "Permanent allocation" }`
* **Authorization**: Requires `master_admin` role. Writes immutable audit log record.

### `PATCH /api/admin/pricing/update`
Adjusts base rates, condition multipliers, or security deposit brackets for a vehicle model.

