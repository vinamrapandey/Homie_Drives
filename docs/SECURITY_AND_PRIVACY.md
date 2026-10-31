# Homie Drives — Security & Privacy Architecture

* **Compliance**: Indian Digital Personal Data Protection (DPDP) Act & IT Act 2000.
* **Architecture Boundary**: Zero client exposure of backend service-role credentials.

---

## 1. Credential & Secret Management
* **Client-Safe Variables**: Only public configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`) may be exposed to the browser.
* **Server-Only Secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `FASTAG_NPCI_SECRET`, `SMS_GATEWAY_TOKEN`, and payment keys must never be exposed or prefixed with `NEXT_PUBLIC_`.
* **Zero Secrets in Git**: Enforced via `.gitignore`. All local `.env` files are blocked from version control.

---

## 2. Customer KYC & Private Document Isolation
* **DigiLocker Integration**: Verification records store only the masked license number (`DL-0420230012345`), verification timestamp, and cryptographic signature hash. Raw government identity documents are not permanently stored in plain text.
* **Encrypted Storage Buckets**:
  * Driving license scans and 360° return inspection videos are saved into private Supabase buckets.
  * Access requires short-lived signed URLs (maximum 15-minute expiry) issued only to authorized agents and administrators.

---

## 3. Telematics & Location Privacy
* **Hardware Governance**: In compliance with platform standards, simulated live GPS tracking is strictly forbidden. When IoT telematics hardware is connected, vehicle GPS positions are only captured during active rental periods.
* **Audit Trail**: Every customer profile access, OTP verification, and vehicle assignment change generates an immutable entry in `audit_logs`.

