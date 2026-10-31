# Homie Drives — User Roles & Permissions Matrix

* **Security Rule**: Never rely on frontend route hiding for authorization. Enforce permissions server-side and via database Row Level Security (RLS).

---

## 1. Role Definitions

| Role | Target Portal | Scope & Description |
| :--- | :--- | :--- |
| **`customer`** | Customer Web (`/`) | Default authenticated user. Can browse fleet, calculate trip costs, book vehicles, manage their active pass, and view their DigiLocker KYC profile. |
| **`agent`** | Agent Portal (`/agent`) | Verified hub staff. Can view only their assigned vehicle fleet, inspect bookings, verify pickup OTPs, record check-in/return videos, and flag vehicles for maintenance. |
| **`master_admin`** | Master Admin (`/admin`) | Company executive. Has full platform oversight across all agents, all vehicles, global pricing, audit logs, and customer records. |

---

## 2. Granular Permissions Matrix

| Operational Capability | Customer | Agent | Master Admin | Enforcement Point |
| :--- | :---: | :---: | :---: | :--- |
| **Browse Active Fleet & Condition Pricing** | ✅ | ✅ | ✅ | Public RLS Policy |
| **Create Reservation** | ✅ | ❌ | ✅ | Server Action + DB Exclude Constraint |
| **View Active Digital Pass & Remote Fob** | Own Only | Own Hub Only | All | RLS (`customer_id = auth.uid()`) |
| **Verify Customer Pickup OTP** | ❌ | Assigned Hub | All | Server Action + Agent Role Check |
| **Upload Inspection Video** | ❌ | Assigned Hub | All | Supabase Storage Signed Policy |
| **Flag Vehicle for Maintenance (Offline)** | ❌ | Assigned Car | All | RLS + Vehicle Assignment Check |
| **Assign / Reassign Vehicle to Agent** | ❌ | ❌ | ✅ | Server Action + `master_admin` Role |
| **Modify Base Rental Rates & Multipliers** | ❌ | ❌ | ✅ | Server Action + Audit Log |
| **Inspect System-Wide Audit Logs** | ❌ | ❌ | ✅ | RLS Restricted to `master_admin` |

