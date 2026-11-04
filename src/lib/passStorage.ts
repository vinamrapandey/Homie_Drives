import { useSyncExternalStore } from "react";
import { ActiveRentalPass } from "@/types/booking";

export const STORAGE_KEY_ACTIVE_PASS = "homie_active_rental_pass";
export const STORAGE_KEY_PASS_ARCHIVE = "homie_pass_archive";
export const EVENT_BOOKING_UPDATED = "homie_booking_updated";

/**
 * Pre-seeded representative demo passes showcasing different hubs,
 * domestic Indian models, supercars, and condition tiers.
 */
export const PRESET_DEMO_PASSES: ActiveRentalPass[] = [
  {
    id: "pass-aston-vantage-01",
    bookingRef: "#HD-DEL-8924",
    carId: "homie-car-01",
    carSlug: "aston-martin-vantage-v8",
    carName: "Aston Martin Vantage V8",
    brand: "Aston Martin",
    carCategory: "Supercar",
    carImage: "/images/cars/homie_vantage_sage.jpg",
    registrationNumber: "DL-01-HD-2025",
    pickupLocation: "Aerocity Hub (IGI Airport)",
    returnLocation: "Aerocity Hub (IGI Airport)",
    pickupDate: "2026-11-14",
    returnDate: "2026-11-17",
    pickupTime: "10:00 AM",
    returnTime: "08:00 PM",
    days: 3,
    conditionTier: "mint",
    conditionLabel: "Executive Mint",
    odometerRange: "5,000–25,000 km",
    protectionPlanName: "VIP Super Shield (Zero-Liability)",
    protectionPlanId: "super",
    excessLiabilityINR: 0,
    fastagBufferINR: 1000,
    fastagBalanceINR: 920,
    totalPaidINR: 76540,
    pin: "8924",
    assignedAgent: "Kabir Mehta",
    agentPhone: "+91 98101 88924",
    driverName: "Arjun Sharma",
    dlNumber: "DL-0420230012345",
    kycStatus: "verified",
    carLocked: true,
    climateControlActive: false,
    hazardLightsActive: false,
    engineReady: true,
    batteryOrFuelLevel: 92,
    fuelType: "Petrol (98 Octane)",
    createdAt: "2026-10-30T07:15:00Z",
  },
  {
    id: "pass-thar-roxx-02",
    bookingRef: "#HD-DEL-4418",
    carId: "homie-car-in-01",
    carSlug: "mahindra-thar-roxx-4x4",
    carName: "Mahindra Thar Roxx 4x4 AX7L",
    brand: "Mahindra",
    carCategory: "Adventure 4x4",
    carImage: "/images/cars/homie_thar_roxx.jpg",
    registrationNumber: "HR-26-TR-4499",
    pickupLocation: "Cyber Hub DLF Phase 2",
    returnLocation: "Cyber Hub DLF Phase 2",
    pickupDate: "2026-11-20",
    returnDate: "2026-11-23",
    pickupTime: "08:00 AM",
    returnTime: "09:00 PM",
    days: 3,
    conditionTier: "pristine",
    conditionLabel: "Showroom Pristine",
    odometerRange: "< 5,000 km",
    protectionPlanName: "Premium Zero-Dep Cover",
    protectionPlanId: "premium",
    excessLiabilityINR: 5000,
    fastagBufferINR: 1000,
    fastagBalanceINR: 1000,
    totalPaidINR: 23150,
    pin: "4418",
    assignedAgent: "Kabir Mehta",
    agentPhone: "+91 98101 88924",
    driverName: "Arjun Sharma",
    dlNumber: "DL-0420230012345",
    kycStatus: "verified",
    carLocked: true,
    climateControlActive: false,
    hazardLightsActive: false,
    engineReady: true,
    batteryOrFuelLevel: 98,
    fuelType: "Petrol (mStallion Turbo)",
    createdAt: "2026-10-30T08:00:00Z",
  },
  {
    id: "pass-nexon-ev-03",
    bookingRef: "#HD-DEL-2671",
    carId: "homie-car-in-02",
    carSlug: "tata-nexon-ev-long-range",
    carName: "Tata Nexon EV Empowered+ LR",
    brand: "Tata",
    carCategory: "City EV",
    carImage: "/images/cars/homie_nexon_ev.jpg",
    registrationNumber: "UP-16-EV-2699",
    pickupLocation: "Sector 18 Hub",
    returnLocation: "Sector 18 Hub",
    pickupDate: "2026-11-18",
    returnDate: "2026-11-20",
    pickupTime: "09:00 AM",
    returnTime: "07:00 PM",
    days: 2,
    conditionTier: "mint",
    conditionLabel: "Executive Mint",
    odometerRange: "5,000–25,000 km",
    protectionPlanName: "Smart Standard Protection",
    protectionPlanId: "basic",
    excessLiabilityINR: 15000,
    fastagBufferINR: 1000,
    fastagBalanceINR: 1000,
    totalPaidINR: 9850,
    pin: "2671",
    assignedAgent: "Pooja Batra",
    agentPhone: "+91 98112 32699",
    driverName: "Arjun Sharma",
    dlNumber: "DL-0420230012345",
    kycStatus: "verified",
    carLocked: true,
    climateControlActive: false,
    hazardLightsActive: false,
    engineReady: true,
    batteryOrFuelLevel: 100,
    fuelType: "Electric (45 kWh Pack)",
    createdAt: "2026-10-30T08:30:00Z",
  },
  {
    id: "pass-safari-sub-04",
    bookingRef: "#HD-DEL-SUB-902",
    carId: "homie-car-in-05",
    carSlug: "tata-safari-dark-edition",
    carName: "Tata Safari Dark Edition Accomplished+",
    brand: "Tata",
    carCategory: "Executive 7-Seater",
    carImage: "/images/cars/homie_safari_dark.jpg",
    registrationNumber: "HR-26-SF-9021",
    pickupLocation: "Cyber Hub DLF Phase 2",
    returnLocation: "Cyber Hub DLF Phase 2",
    pickupDate: "2026-11-01",
    returnDate: "2026-11-30",
    pickupTime: "10:00 AM",
    returnTime: "08:00 PM",
    days: 30,
    conditionTier: "pristine",
    conditionLabel: "Showroom Pristine",
    odometerRange: "< 5,000 km",
    protectionPlanName: "VIP Super Shield (Zero-Liability)",
    protectionPlanId: "super",
    excessLiabilityINR: 0,
    fastagBufferINR: 1000,
    fastagBalanceINR: 760,
    totalPaidINR: 98000,
    pin: "9021",
    assignedAgent: "Kabir Mehta",
    agentPhone: "+91 98101 88924",
    driverName: "Ananya Deshmukh",
    dlNumber: "DL-0420230012345",
    kycStatus: "verified",
    carLocked: true,
    climateControlActive: false,
    hazardLightsActive: false,
    engineReady: true,
    batteryOrFuelLevel: 88,
    fuelType: "Diesel (Kryotec 170)",
    planType: "monthly",
    isSubscription: true,
    nextServiceDueDate: "2026-12-01",
    monthlyRenewalDate: "2026-12-01",
    replacementVehicleGuarantee: true,
    createdAt: "2026-10-31T06:00:00Z",
  },
];

/**
 * Retrieve the active rental pass from localStorage, or return the default demo pass.
 */
export function getActivePass(): ActiveRentalPass {
  if (typeof window === "undefined") {
    return PRESET_DEMO_PASSES[0];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_PASS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.bookingRef) {
        return parsed as ActiveRentalPass;
      }
    }
  } catch (err) {
    console.error("Failed to read active pass from localStorage", err);
  }

  return PRESET_DEMO_PASSES[0];
}

/**
 * Save an active rental pass to localStorage and notify all listeners.
 */
export function saveActivePass(pass: ActiveRentalPass): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PASS, JSON.stringify(pass));

    // Also append to archive if not already present
    const archive = getPassArchive();
    const existingIndex = archive.findIndex((p) => p.bookingRef === pass.bookingRef);
    if (existingIndex >= 0) {
      archive[existingIndex] = pass;
    } else {
      archive.unshift(pass);
    }
    localStorage.setItem(STORAGE_KEY_PASS_ARCHIVE, JSON.stringify(archive));

    // Dispatch custom event for real-time reactive updates
    window.dispatchEvent(new CustomEvent(EVENT_BOOKING_UPDATED, { detail: pass }));
  } catch (err) {
    console.error("Failed to save active pass to localStorage", err);
  }
}

/**
 * Update partial fields (e.g. keyless lock state, climate) on the active pass.
 */
export function updateActivePassState(updates: Partial<ActiveRentalPass>): ActiveRentalPass {
  const current = getActivePass();
  const updated: ActiveRentalPass = { ...current, ...updates };
  saveActivePass(updated);
  return updated;
}

/**
 * Retrieve the archive of passes (both presets and user-created).
 */
export function getPassArchive(): ActiveRentalPass[] {
  if (typeof window === "undefined") {
    return PRESET_DEMO_PASSES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASS_ARCHIVE);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list as ActiveRentalPass[];
      }
    }
  } catch (err) {
    console.error("Failed to read pass archive from localStorage", err);
  }

  return PRESET_DEMO_PASSES;
}

/**
 * Reset active pass back to a specific preset demo pass.
 */
export function resetToPresetPass(passId: string): ActiveRentalPass {
  const target = PRESET_DEMO_PASSES.find((p) => p.id === passId) || PRESET_DEMO_PASSES[0];
  saveActivePass(target);
  return target;
}

// Global subscription listener for React useSyncExternalStore
function subscribePassUpdates(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_BOOKING_UPDATED, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_BOOKING_UPDATED, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedActivePassRaw: string | null = null;
let cachedActivePass: ActiveRentalPass = PRESET_DEMO_PASSES[0];

/**
 * React hook to synchronize active pass across components without cascading renders.
 */
export function useActivePass(): ActiveRentalPass {
  return useSyncExternalStore(
    subscribePassUpdates,
    () => {
      if (typeof window === "undefined") return PRESET_DEMO_PASSES[0];
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_PASS);
      if (raw !== cachedActivePassRaw) {
        cachedActivePassRaw = raw;
        cachedActivePass = raw ? JSON.parse(raw) : PRESET_DEMO_PASSES[0];
      }
      return cachedActivePass;
    },
    () => PRESET_DEMO_PASSES[0]
  );
}

let cachedArchiveRaw: string | null = null;
let cachedArchive: ActiveRentalPass[] = PRESET_DEMO_PASSES;

/**
 * React hook to synchronize pass archive across components.
 */
export function usePassArchive(): ActiveRentalPass[] {
  return useSyncExternalStore(
    subscribePassUpdates,
    () => {
      if (typeof window === "undefined") return PRESET_DEMO_PASSES;
      const raw = localStorage.getItem(STORAGE_KEY_PASS_ARCHIVE);
      if (raw !== cachedArchiveRaw) {
        cachedArchiveRaw = raw;
        cachedArchive = raw ? JSON.parse(raw) : PRESET_DEMO_PASSES;
      }
      return cachedArchive;
    },
    () => PRESET_DEMO_PASSES
  );
}
