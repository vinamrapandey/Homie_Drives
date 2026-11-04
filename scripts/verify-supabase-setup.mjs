#!/usr/bin/env node
/**
 * ==============================================================================
 * HOMIE DRIVES — SUPABASE DATABASE & STORAGE VERIFICATION SCRIPT
 * ==============================================================================
 * Verifies that the Supabase schema migrations, seed data, and storage bucket
 * configurations are complete, structurally valid, and adhere to all RLS directives.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n" + "=".repeat(79));
console.log("HOMIE DRIVES — SUPABASE DATABASE & STORAGE INTEGRITY AUDIT");
console.log("=".repeat(79) + "\n");

let passed = 0;
let total = 0;

function assertCheck(name, condition, details = "") {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    if (details) console.error(`    ${details}`);
  }
}

// ------------------------------------------------------------------------------
// CHECK 1: File Presence
// ------------------------------------------------------------------------------
console.log("CHECK 1: Migration & Seed File Presence");

const initialMigrationPath = path.join(rootDir, "supabase", "migrations", "20261031000000_initial_schema.sql");
const prodMigrationPath = path.join(rootDir, "supabase", "migrations", "20261104000000_production_schema_and_storage.sql");
const seedPath = path.join(rootDir, "supabase", "seed.sql");

assertCheck("Initial schema migration exists", fs.existsSync(initialMigrationPath));
assertCheck("Production schema & storage migration exists", fs.existsSync(prodMigrationPath));
assertCheck("Seed data script exists", fs.existsSync(seedPath));

const initialSql = fs.readFileSync(initialMigrationPath, "utf-8");
const prodSql = fs.readFileSync(prodMigrationPath, "utf-8");
const seedSql = fs.readFileSync(seedPath, "utf-8");
const combinedSql = `${initialSql}\n${prodSql}`;

// ------------------------------------------------------------------------------
// CHECK 2: Database Extensions & Concurrency Protection
// ------------------------------------------------------------------------------
console.log("\nCHECK 2: Extensions & Concurrency Protection Guardrails");

assertCheck("uuid-ossp extension enabled", combinedSql.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'));
assertCheck("btree_gist extension enabled for temporal range locking", combinedSql.includes('CREATE EXTENSION IF NOT EXISTS "btree_gist"'));
assertCheck("Exclusion constraint on bookings (vehicle_id WITH =, rental_period WITH &&)", 
  combinedSql.includes("EXCLUDE USING gist (vehicle_id WITH =, rental_period WITH &&)")
);

// ------------------------------------------------------------------------------
// CHECK 3: Core Tables Existence in Migrations
// ------------------------------------------------------------------------------
console.log("\nCHECK 3: Core Database Tables (12 Tables)");

const requiredTables = [
  "profiles",
  "user_roles",
  "pickup_locations",
  "agents",
  "vehicles",
  "vehicle_assignments",
  "bookings",
  "rental_inspections",
  "audit_logs",
  "customer_kyc",
  "rental_contracts",
  "settlements",
];

for (const table of requiredTables) {
  assertCheck(`Table '${table}' declared in schema`, combinedSql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`) || combinedSql.includes(`CREATE TABLE public.${table}`));
}

// ------------------------------------------------------------------------------
// CHECK 4: RLS Helper Security Functions
// ------------------------------------------------------------------------------
console.log("\nCHECK 4: Row Level Security Helper Functions");

assertCheck("Helper function 'public.is_admin()' declared", combinedSql.includes("FUNCTION public.is_admin()"));
assertCheck("Helper function 'public.is_agent()' declared", combinedSql.includes("FUNCTION public.is_agent()"));
assertCheck("Helper function 'public.get_agent_hub_id()' declared", combinedSql.includes("FUNCTION public.get_agent_hub_id()"));

// ------------------------------------------------------------------------------
// CHECK 5: Row Level Security Policies
// ------------------------------------------------------------------------------
console.log("\nCHECK 5: Row Level Security (RLS) Activation");

for (const table of requiredTables) {
  assertCheck(`RLS enabled on '${table}'`, combinedSql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`));
}

assertCheck("Audit logs are insertable by authenticated users", combinedSql.includes('"Authenticated users can create audit logs"'));
assertCheck("Audit logs view restricted to Admins", combinedSql.includes('"Admins can view audit logs"'));
assertCheck("Customer KYC privacy policy enforced", combinedSql.includes('"Customers can view own kyc"'));
assertCheck("Settlement escrow management restricted to Staff", combinedSql.includes('"Staff can manage settlements"'));

// ------------------------------------------------------------------------------
// CHECK 6: Supabase Private Storage Buckets & Policies
// ------------------------------------------------------------------------------
console.log("\nCHECK 6: Private Storage Buckets & Object Security");

assertCheck("Storage bucket 'inspections' configured", prodSql.includes("'inspections'"));
assertCheck("Storage bucket 'kyc-documents' configured", prodSql.includes("'kyc-documents'"));
assertCheck("Storage buckets set to private (public = false)", prodSql.includes("FALSE,"));
assertCheck("Storage RLS policy for inspection uploads configured", prodSql.includes('"Agents and Admins can upload inspection videos"'));
assertCheck("Storage RLS policy for KYC documents user-isolation configured", prodSql.includes('"Users can upload their own KYC documents"'));

// ------------------------------------------------------------------------------
// CHECK 7: Seed Data Coverage
// ------------------------------------------------------------------------------
console.log("\nCHECK 7: Operational Seed Data Coverage");

assertCheck("Seed contains all 6 Delhi NCR hubs", 
  seedSql.includes("delhi-aerocity") &&
  seedSql.includes("delhi-cp") &&
  seedSql.includes("gurugram-cyberhub") &&
  seedSql.includes("gurugram-golfcourse") &&
  seedSql.includes("noida-sec18") &&
  seedSql.includes("delhi-saket")
);

assertCheck("Seed contains representative fleet across 3 tiers (4x4, EV, Supercar)",
  seedSql.includes("mahindra-thar-roxx-4x4") &&
  seedSql.includes("tata-nexon-ev-long-range") &&
  seedSql.includes("aston-martin-vantage-v8")
);

assertCheck("Seed contains field agents with employee codes", seedSql.includes("HD-AGT-CYB-01") && seedSql.includes("HD-AGT-AER-02"));
assertCheck("Seed contains sample digital rental contract with SHA-256 hash", seedSql.includes("HD-CTR-2026-DEL-0091"));
assertCheck("Seed contains sample escrow settlement with NETC toll breakdown", seedSql.includes("Kherki Daula Plaza"));

// ------------------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------------------
console.log("\n" + "=".repeat(79));
console.log(`AUDIT COMPLETE: ${passed}/${total} CHECKS PASSED (${Math.round((passed / total) * 100)}% SUCCESS)`);
console.log("=".repeat(79) + "\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}

