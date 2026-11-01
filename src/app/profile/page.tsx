"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActivePass, saveActivePass } from "@/lib/passStorage";
import { useAuth } from "@/lib/supabase/auth";
import { useUserBookings, mapBookingToActivePass } from "@/lib/supabase/bookings";
import { AuthModal } from "@/components/auth/AuthModal";
import { formatINR } from "@/lib/formatters";
import {
  User,
  FileText,
  Phone,
  Car,
  Bell,
  Globe,
  MapPin,
  Lock,
  CheckCircle,
  ShieldCheck,
  X,
  LogIn,
  LogOut,
  Sparkles,
  Cloud,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [activeSubSection, setActiveSubSection] = useState<
    "overview" | "rentals" | "documents" | "support" | "settings"
  >("overview");
  const activePass = useActivePass();
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { bookings, loading: bookingsLoading } = useUserBookings();

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AS";
  const userDisplayName = user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Arjun Sharma");
  const userEmail = user?.email || "arjun.sharma@example.com";
  const userPhone = user?.phone || "+91 98765 43210";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Auth CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172016] tracking-tight">
            Customer Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6B5A] mt-1">
            Manage your Homie Drives profile, verification status, and rental documentation.
          </p>
        </div>

        {user ? (
          <button
            type="button"
            onClick={signOut}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#50644E] hover:bg-[#3F503D] transition-colors shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In with OTP</span>
          </button>
        )}
      </div>

      {/* Auth Banner if Guest */}
      {!user && (
        <div className="bg-[#F3F6F1] border border-[#CAD8C6] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#50644E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#172016]">
                Viewing Demo Profile Mode
              </p>
              <p className="text-[11px] text-[#5C6B5A]">
                Sign in with your email to unlock your personal rentals and real-time trip synchronization.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="text-xs font-bold text-[#50644E] hover:underline shrink-0"
          >
            Sign In Now →
          </button>
        </div>
      )}

      {/* Account Overview Header Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E8EFE5] shadow-homie">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4ED]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#50644E] text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#172016]">{userDisplayName}</h2>
                <span className="text-[10px] font-bold bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-full">
                  {user ? "Supabase Auth" : "Demo User"}
                </span>
              </div>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                {userPhone} • {userEmail}
              </p>
              <p className="text-xs text-[#829280] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                <span>Primary Hub: Aerocity Hub (IGI Airport, New Delhi)</span>
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-[#829280] block">Fleet Membership</span>
            <span className="text-sm font-bold text-[#172016] block">
              {user ? "Verified Member" : "Homie Club Member"}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Active Account</span>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="mt-5 p-4 rounded-2xl bg-[#EAF0E7] border border-[#CAD8C6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#2F3D2E]">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#50644E] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-[#172016]">
                  DigiLocker Driver KYC Authenticated
                </p>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Government Verified
                </span>
              </div>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                Indian Driving License (DL-0420230012345) &amp; Aadhaar e-KYC linked for keyless dispatch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowKycModal(true)}
            className="bg-[#50644E] hover:bg-[#3F503D] text-white font-bold text-xs py-2 px-4 rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            View DigiLocker Card
          </button>
        </div>
      </div>

      {/* Profile Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#E1E8DF] pb-2 text-xs font-bold">
        {[
          { id: "overview", label: "My Rentals" },
          { id: "documents", label: "Rental Documents" },
          { id: "support", label: "Help & 24x7 Roadside" },
          { id: "settings", label: "Preferences & Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubSection(tab.id as typeof activeSubSection)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSubSection === tab.id
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}

      {/* SECTION 1: MY RENTALS */}
      {activeSubSection === "overview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172016] flex items-center gap-1.5">
              <span>Rental Passes &amp; Bookings</span>
              {user && (
                <span className="text-[10px] bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-full font-bold">
                  Supabase Live Sync
                </span>
              )}
            </h3>
            <span className="text-xs text-[#50644E] font-medium">
              {user ? `${bookings.length} Cloud Booking${bookings.length === 1 ? "" : "s"}` : "1 Demo Pass Active"}
            </span>
          </div>

          {/* If user is signed in and has live Supabase bookings */}
          {user && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const pass = mapBookingToActivePass(booking, user.email);
                const statusLabels: Record<string, { label: string; color: string }> = {
                  pending_pickup: { label: "Pending Pickup at Hub", color: "bg-amber-100 text-amber-800" },
                  verified_handover: { label: "OTP Verified • Key Handed", color: "bg-blue-100 text-blue-800" },
                  active_rental: { label: "Active Rental • In Trip", color: "bg-emerald-100 text-emerald-800" },
                  returned_inspected: { label: "Returned • Inspection Passed", color: "bg-purple-100 text-purple-800" },
                  closed: { label: "Completed & Closed", color: "bg-gray-100 text-gray-800" },
                  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
                };
                const statusMeta = statusLabels[booking.status] || {
                  label: booking.status,
                  color: "bg-gray-100 text-gray-800",
                };

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#CAD8C6]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#172016]">
                            {booking.vehicles?.name || "Homie Vehicle"}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C6B5A] mt-0.5">
                          {pass.pickupDate} – {pass.returnDate} ({pass.days} Days) • {pass.pickupLocation}
                        </p>
                        <p className="text-[11px] text-[#829280]">
                          Booking Ref:{" "}
                          <strong className="font-mono text-[#172016]">{booking.booking_code}</strong> • Pickup OTP:{" "}
                          <span className="font-mono font-bold text-[#50644E]">{booking.pickup_otp_hash || "8924"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-extrabold text-sm text-[#172016]">
                        {formatINR(booking.total_amount_inr)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          saveActivePass(pass);
                          router.push("/ride?tab=pass");
                        }}
                        className="bg-[#50644E] text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#3F503D] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Open Pass</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Active Demo / Fallback Card */
            <div className="bg-white rounded-2xl p-5 border border-[#E8EFE5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#172016]">
                      {activePass ? activePass.carName : "Aston Martin Vantage V8"}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      {activePass?.carLocked ? "Ready at Hub" : "Unlocked • In Trip"}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C6B5A] mt-0.5">
                    {activePass
                      ? `${activePass.pickupDate} – ${activePass.returnDate} (${activePass.days} Days)`
                      : "14 Nov 2026 – 17 Nov 2026 (3 Days)"}{" "}
                    • {activePass?.pickupLocation || "Aerocity Hub"}
                  </p>
                  <p className="text-[11px] text-[#829280]">
                    Booking Ref:{" "}
                    <strong className="font-mono text-[#172016]">
                      {activePass?.bookingRef || "#HD-DEL-8924"}
                    </strong>{" "}
                    • Reg:{" "}
                    <span className="font-mono">
                      {activePass?.registrationNumber || "DL-01-HD-2025"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-extrabold text-sm text-[#172016]">
                  {activePass ? formatINR(activePass.totalPaidINR) : "₹67,497"} Total
                </span>
                <Link
                  href="/ride?tab=pass"
                  className="bg-[#50644E] text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#3F503D] transition-colors"
                >
                  View Live Pass →
                </Link>
              </div>
            </div>
          )}

          <div className="p-5 bg-white rounded-2xl border border-dashed border-[#DFE6DC] text-center text-xs text-[#829280]">
            Past completed trips are stored in your encrypted audit ledger with downloadable GST invoices and check-out video inspections.
          </div>
        </div>
      )}

      {/* SECTION 2: RENTAL DOCUMENTS */}
      {activeSubSection === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172016]">
              Rental Agreements & Terms
            </h3>
            <span className="text-xs text-[#829280]">Standard Delhi NCR Policies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "Homie Master Rental Agreement",
                desc: "Standard self-drive contract governing vehicle care, driver liability, and Delhi NCR territory boundary.",
                tag: "PDF Template",
              },
              {
                title: "Comprehensive Insurance Policy",
                desc: "Zero-depreciation bumper-to-bumper cover details, roadside salvage, and personal accident terms.",
                tag: "Included",
              },
              {
                title: "Security Deposit Refund Matrix",
                desc: "Guidelines for prompt post-dropoff deposit release (within 24–48 hours) upon return inspection.",
                tag: "Terms",
              },
              {
                title: "Fuel & Fastag Settlement Terms",
                desc: "Full-to-full fuel standard policy and automated Fastag toll clearing mechanism.",
                tag: "Policy",
              },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-[#E8EFE5] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-4 h-4 text-[#50644E]" />
                    <span className="text-[10px] font-bold bg-[#EAF0E7] text-[#50644E] px-2 py-0.5 rounded-full">
                      {doc.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#172016]">{doc.title}</h4>
                  <p className="text-xs text-[#5C6B5A] mt-1 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Previewing ${doc.title} (Document template).`)}
                  className="mt-3 text-left text-xs font-bold text-[#50644E] hover:underline"
                >
                  View Document Draft →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: HELP & SUPPORT */}
      {activeSubSection === "support" && (
        <div className="bg-white rounded-2xl p-6 border border-[#E8EFE5] shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#172016]">
              24x7 Delhi NCR Roadside Concierge
            </h3>
            <p className="text-xs text-[#5C6B5A] mt-0.5">
              Instant assistance for mechanical support, puncture repair, towing, or route assistance anywhere in Delhi NCR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F8FAF7] p-4 rounded-xl border border-[#E8EFE5]">
              <Phone className="w-5 h-5 text-[#50644E] mb-2" />
              <h4 className="font-bold text-sm text-[#172016]">Roadside Hotline</h4>
              <p className="text-[#5C6B5A] mt-0.5">+91 11-4000-HOMIE (Demo)</p>
              <p className="text-[11px] text-[#829280] mt-1">Available 24x7 across Delhi NCR</p>
            </div>

            <div className="bg-[#F8FAF7] p-4 rounded-xl border border-[#E8EFE5]">
              <User className="w-5 h-5 text-[#50644E] mb-2" />
              <h4 className="font-bold text-sm text-[#172016]">WhatsApp Fleet Concierge</h4>
              <p className="text-[#5C6B5A] mt-0.5">+91 98110-HOMIE (Demo)</p>
              <p className="text-[11px] text-[#829280] mt-1">Chat for hub directions and extensions</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F4ED]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172016] mb-2">
              Frequently Asked Questions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#F8FAF7] rounded-xl">
                <p className="font-bold text-[#172016]">Can I pick up in Gurugram and drop in Noida?</p>
                <p className="text-[#5C6B5A] mt-1">
                  For this initial release, all rentals must use the same pickup and return location. Inter-city hub returns will be introduced in subsequent phases.
                </p>
              </div>
              <div className="p-3 bg-[#F8FAF7] rounded-xl">
                <p className="font-bold text-[#172016]">What is the security deposit refund timeline?</p>
                <p className="text-[#5C6B5A] mt-1">
                  Refundable security deposits (₹5,000 for standard cars, ₹15,000 for supercars) are released back to your bank account within 24 to 48 hours following vehicle check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PREFERENCES & SETTINGS */}
      {activeSubSection === "settings" && (
        <div className="bg-white rounded-2xl p-6 border border-[#E8EFE5] shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-[#172016]">Account Preferences</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F8FAF7] rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#50644E]" />
                <div>
                  <p className="font-bold text-[#172016]">Language & Currency</p>
                  <p className="text-[#829280]">English (India) • INR (₹)</p>
                </div>
              </div>
              <span className="text-[#50644E] font-semibold">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAF7] rounded-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#50644E]" />
                <div>
                  <p className="font-bold text-[#172016]">Notifications</p>
                  <p className="text-[#829280]">SMS and WhatsApp trip alerts</p>
                </div>
              </div>
              <span className="text-emerald-700 font-semibold">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAF7] rounded-xl">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#50644E]" />
                <div>
                  <p className="font-bold text-[#172016]">Privacy & Terms</p>
                  <p className="text-[#829280]">Homie Drives Phase 1 Prototype</p>
                </div>
              </div>
              <span className="text-[#829280]">v1.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* DigiLocker Driver KYC Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-homie-lg border border-[#E1E8DF] relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#50644E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#50644E]">
                  DigiLocker Verified Credential
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKycModal(false)}
                className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Card Styling */}
            <div className="bg-gradient-to-br from-[#172016] via-[#2A3B28] to-[#172016] text-white p-5 rounded-[24px] shadow-homie border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <div>
                  <span className="text-[10px] text-[#A2BA9F] uppercase font-bold tracking-wider block">
                    Govt. of NCT of Delhi • Transport Dept
                  </span>
                  <span className="text-sm font-extrabold tracking-wide">
                    INDIAN DRIVING LICENSE
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  LMV-NT
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block">DL Number</span>
                  <span className="font-mono font-bold text-sm text-emerald-300">
                    {activePass?.dlNumber || "DL-0420230012345"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[10px] text-white/50 block">Licensee</span>
                    <strong className="text-white">{activePass?.driverName || "Arjun Sharma"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Date of Birth</span>
                    <span className="text-white">14-Aug-1996 (Age 28)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Valid Until</span>
                    <span className="text-white">24-Jul-2038</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Issuing Authority</span>
                    <span className="text-white">RTO DL-04 Janakpuri</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
                <span>Cryptographically Authenticated</span>
                <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAF7] rounded-xl text-xs text-[#5C6B5A] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Eligible for all Homie Drives luxury SUVs, city EVs, and supercars in Delhi NCR.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowKycModal(false)}
              className="w-full py-3 rounded-full bg-[#50644E] text-white font-bold text-xs hover:bg-[#3F503D] transition-colors cursor-pointer"
            >
              Close Credential
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
