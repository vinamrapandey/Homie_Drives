"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "./client";
import { useAuth } from "./auth";
import { ActiveRentalPass } from "@/types/booking";
import { DEMO_CARS } from "@/data/cars";
import { calculateRentalDays } from "@/lib/formatters";

export interface SupabaseBookingRecord {
  id: string;
  booking_code: string;
  customer_id: string;
  vehicle_id: string;
  pickup_hub_id: string;
  condition_tier: "pristine" | "mint" | "touring";
  rental_period: string;
  pickup_time: string;
  return_time: string;
  daily_rate_inr: number;
  total_amount_inr: number;
  security_deposit_inr: number;
  damage_protection_tier: string;
  fastag_buffer_inr: number;
  status:
    | "pending_pickup"
    | "verified_handover"
    | "active_rental"
    | "returned_inspected"
    | "closed"
    | "cancelled";
  pickup_otp_hash: string | null;
  created_at: string;
  vehicles?: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    category: string;
    registration_number: string;
  } | null;
  pickup_locations?: {
    id: string;
    name: string;
    slug: string;
    address: string;
  } | null;
}

/**
 * Converts a Supabase PostgreSQL booking row into the rich ActiveRentalPass structure
 */
export function mapBookingToActivePass(
  booking: SupabaseBookingRecord,
  userEmail?: string | null
): ActiveRentalPass {
  const matchedCar = DEMO_CARS.find((c) => c.slug === booking.vehicles?.slug) || DEMO_CARS[0];
  const pickupDateStr = booking.pickup_time ? booking.pickup_time.split("T")[0] : "2026-11-15";
  const returnDateStr = booking.return_time ? booking.return_time.split("T")[0] : "2026-11-18";
  const days = Math.max(1, calculateRentalDays(pickupDateStr, returnDateStr));

  const conditionLabels: Record<string, string> = {
    pristine: "Showroom Pristine",
    mint: "Executive Mint",
    touring: "Standard Touring",
  };

  const protectionNames: Record<string, string> = {
    basic: "Homie Standard Care",
    premium: "Zero Excess Comprehensive",
    super: "Supreme Peace of Mind",
  };

  const hubName =
    booking.pickup_locations?.name || matchedCar.hubLocation || "Aerocity Hub (IGI Airport)";

  return {
    id: `pass-db-${booking.id}`,
    bookingRef: booking.booking_code,
    carId: booking.vehicle_id,
    carSlug: matchedCar.slug,
    carName: booking.vehicles?.name || matchedCar.name,
    carCategory: matchedCar.categoryLabel || matchedCar.category,
    carImage: matchedCar.image,
    brand: booking.vehicles?.brand || matchedCar.brand,
    registrationNumber:
      booking.vehicles?.registration_number || `DL-01-HD-${booking.booking_code.slice(-4)}`,
    pickupLocation: hubName,
    returnLocation: hubName,
    pickupDate: pickupDateStr,
    returnDate: returnDateStr,
    pickupTime: "10:00 AM",
    returnTime: "08:00 PM",
    days,
    conditionTier: booking.condition_tier || "mint",
    conditionLabel: conditionLabels[booking.condition_tier] || "Executive Mint",
    odometerRange: "5,000–25,000 km",
    protectionPlanName: protectionNames[booking.damage_protection_tier] || "Zero Excess Comprehensive",
    protectionPlanId: (booking.damage_protection_tier as "basic" | "premium" | "super") || "premium",
    excessLiabilityINR: booking.damage_protection_tier === "super" ? 0 : 5000,
    fastagBufferINR: booking.fastag_buffer_inr || 0,
    fastagBalanceINR: booking.fastag_buffer_inr || 0,
    totalPaidINR: booking.total_amount_inr,
    pin: booking.pickup_otp_hash || booking.booking_code.slice(-4),
    assignedAgent: matchedCar.agentAssigned || "Kabir Mehta (Delhi Central)",
    agentPhone: "+91 98101 88924",
    driverName: userEmail ? userEmail.split("@")[0] : "Arjun Sharma",
    dlNumber: "DL-0420230012345",
    kycStatus: "verified",
    carLocked: true,
    climateControlActive: false,
    hazardLightsActive: false,
    engineReady: true,
    batteryOrFuelLevel: matchedCar.telematicsStatus?.fuelOrBatteryPercent ?? 92,
    fuelType: matchedCar.specs.fuelType,
    createdAt: booking.created_at,
  };
}

/**
 * React Hook to subscribe to the authenticated customer's live Supabase bookings
 */
export function useUserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<SupabaseBookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_code,
          customer_id,
          vehicle_id,
          pickup_hub_id,
          condition_tier,
          rental_period,
          pickup_time,
          return_time,
          daily_rate_inr,
          total_amount_inr,
          security_deposit_inr,
          damage_protection_tier,
          fastag_buffer_inr,
          status,
          pickup_otp_hash,
          created_at,
          vehicles (
            id,
            name,
            slug,
            brand,
            category,
            registration_number
          ),
          pickup_locations (
            id,
            name,
            slug,
            address
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setBookings((data as unknown as SupabaseBookingRecord[]) || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load bookings";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchBookings,
  };
}

