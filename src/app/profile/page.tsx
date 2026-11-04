"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActivePass, saveActivePass } from "@/lib/passStorage";
import { useAuth } from "@/lib/supabase/auth";
import { useUserBookings, mapBookingToActivePass } from "@/lib/supabase/bookings";
import { AuthModal } from "@/components/auth/AuthModal";
import { TaxInvoiceModal, InvoiceData } from "@/components/invoice/TaxInvoiceModal";
import { formatINR } from "@/lib/formatters";
import { CustomerKYCRecord } from "@/types/kyc";
import { INITIAL_KYC_RECORDS } from "@/data/kycRecords";
import { submitCustomerKYCAction } from "@/actions/kyc";
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
  Receipt,
  Download,
  MessageCircle,
  Edit3,
  KeyRound,
  ShieldAlert,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileBadge,
  BadgeAlert,
  ArrowRight,
  Check,
  Copy,
  QrCode,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [activeSubSection, setActiveSubSection] = useState<
    "overview" | "rentals" | "vault" | "documents" | "support" | "settings"
  >("overview");
  const [copiedDl, setCopiedDl] = useState(false);
  const handleCopyDl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDl(true);
    setTimeout(() => setCopiedDl(false), 2000);
  };
  const activePass = useActivePass();
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const { user, signOut, updateProfile, userRole } = useAuth();
  const { bookings, loading: bookingsLoading } = useUserBookings();

  // Profile Editor Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [dlInput, setDlInput] = useState("");
  const [emergencyInput, setEmergencyInput] = useState("");
  const [dlImageInput, setDlImageInput] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const userDisplayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : user?.phone ? `Member (${user.phone.slice(-4)})` : "Arjun Sharma");
  const userEmail = user?.email || user?.user_metadata?.email || "Not linked";
  const userPhone = user?.phone || user?.user_metadata?.phone_number || "+91 98765 43210";
  const userDlNumber = user?.user_metadata?.digilocker_dl_number || "DL-0420230012345";
  const userEmergencyContact = user?.user_metadata?.emergency_contact || "+91 84487 86016";
  const userDlImage = user?.user_metadata?.dl_image_url || null;

  const userInitials = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "HD";

  // Customer KYC & DigiLocker Flow State
  const [customerKyc, setCustomerKyc] = useState<CustomerKYCRecord>(
    INITIAL_KYC_RECORDS[0]
  );
  const [showDigiLockerFlowModal, setShowDigiLockerFlowModal] = useState(false);
  const [digiLockerStep, setDigiLockerStep] = useState<1 | 2 | 3>(1);
  const [digiLockerFullName, setDigiLockerFullName] = useState(userDisplayName);
  const [digiLockerPhone, setDigiLockerPhone] = useState("9811234567");
  const [digiLockerAadhaar, setDigiLockerAadhaar] = useState("XXXXXXXX8492");
  const [digiLockerDlNumber, setDigiLockerDlNumber] = useState("DL-04-2018-0091823");
  const [digiLockerOtp, setDigiLockerOtp] = useState("8924");
  const [isVerifyingDigiLocker, setIsVerifyingDigiLocker] = useState(false);
  const [digiLockerUploadedImage, setDigiLockerUploadedImage] = useState<string | null>(null);
  const [kycSubmitFeedback, setKycSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleStartDigiLocker = () => {
    setDigiLockerFullName(userDisplayName);
    setDigiLockerPhone(userPhone.replace(/\D/g, "").slice(-10) || "9811234567");
    setDigiLockerDlNumber(customerKyc.drivingLicense.dlNumber || "DL-04-2018-0091823");
    setDigiLockerAadhaar(customerKyc.aadhaar.maskedNumber || "XXXXXXXX8492");
    setDigiLockerOtp("8924");
    setDigiLockerStep(1);
    setKycSubmitFeedback(null);
    setShowDigiLockerFlowModal(true);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingDigiLocker(true);
    setKycSubmitFeedback(null);
    setTimeout(() => {
      setIsVerifyingDigiLocker(false);
      setDigiLockerStep(2);
    }, 700);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingDigiLocker(true);
    setKycSubmitFeedback(null);
    setTimeout(() => {
      setIsVerifyingDigiLocker(false);
      setDigiLockerStep(3);
    }, 600);
  };

  const handleDigiLockerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDigiLockerUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAndSubmitKyc = async () => {
    setIsVerifyingDigiLocker(true);
    setKycSubmitFeedback(null);

    try {
      const res = await submitCustomerKYCAction({
        fullName: digiLockerFullName,
        phone: digiLockerPhone,
        email: userEmail !== "Not linked" ? userEmail : "arjun.sharma@example.com",
        aadhaarNumber: digiLockerAadhaar,
        dob: "1997-04-12",
        address: "B-4/112, Safdarjung Enclave",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110029",
        dlNumber: digiLockerDlNumber,
        issuingRTO: "DL-04 Janakpuri, West Delhi",
        vehicleClasses: ["LMV-NT", "MCWG"],
        expiryDate: "2038-05-13",
        cardImageUrl: digiLockerUploadedImage || undefined,
      });

      if (res.success && res.record) {
        setCustomerKyc(res.record as CustomerKYCRecord);
        setKycSubmitFeedback({
          type: "success",
          message: res.message || "DigiLocker verification successfully completed!",
        });
        setTimeout(() => {
          setShowDigiLockerFlowModal(false);
          setKycSubmitFeedback(null);
        }, 1500);
      } else {
        setKycSubmitFeedback({
          type: "error",
          message: res.error || "Failed to submit DigiLocker verification.",
        });
      }
    } catch (err) {
      setKycSubmitFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error submitting KYC.",
      });
    } finally {
      setIsVerifyingDigiLocker(false);
    }
  };

  const handleOpenEditProfile = () => {
    setFullNameInput(userDisplayName);
    setPhoneInput(userPhone.replace("+91", "").trim());
    setDlInput(userDlNumber);
    setEmergencyInput(userEmergencyContact);
    setDlImageInput(userDlImage);
    setProfileFeedback(null);
    setShowEditProfileModal(true);
  };

  const handleDlImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDlImageInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);

    try {
      await updateProfile({
        full_name: fullNameInput.trim(),
        phone_number: phoneInput.trim(),
        dl_number: dlInput.trim(),
        emergency_contact: emergencyInput.trim(),
        dl_image_url: dlImageInput || undefined,
      });
      setProfileFeedback({
        type: "success",
        message: "Profile details updated successfully.",
      });
      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileFeedback(null);
      }, 1200);
    } catch (err) {
      setProfileFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 space-y-6">
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

        <div className="flex flex-wrap items-center gap-2">
          {userRole === "master_admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#172016] hover:bg-[#253224] transition-colors border border-red-500/30"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Portal →</span>
            </Link>
          )}

          {userRole === "agent" && (
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#172016] bg-emerald-100 hover:bg-emerald-200 transition-colors border border-emerald-300"
            >
              <span>Agent Portal →</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#172016] bg-[#F3F6F1] hover:bg-[#E8EFE5] transition-colors border border-[#DFE6DC] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#50644E]" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#50644E] hover:bg-[#3F503D] transition-colors shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with OTP</span>
            </button>
          )}
        </div>
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
                <span>Primary Hub: Ghaziabad Hub (RDC Raj Nagar • Delhi NCR)</span>
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

        {/* Dynamic DigiLocker Verification Status Card */}
        <div
          className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            customerKyc.digilockerStatus === "verified"
              ? "bg-[#EAF0E7] border-[#CAD8C6] text-[#2F3D2E]"
              : customerKyc.digilockerStatus === "pending_review"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {customerKyc.digilockerStatus === "verified" ? (
              <ShieldCheck className="w-5 h-5 text-[#50644E] shrink-0 mt-0.5" />
            ) : customerKyc.digilockerStatus === "pending_review" ? (
              <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm text-[#172016]">
                  {customerKyc.digilockerStatus === "verified"
                    ? "DigiLocker Driver KYC Authenticated"
                    : customerKyc.digilockerStatus === "pending_review"
                    ? "DigiLocker KYC Pending Administrative Review"
                    : "Action Required: Driver Credential Flagged"}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    customerKyc.digilockerStatus === "verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : customerKyc.digilockerStatus === "pending_review"
                      ? "bg-amber-200 text-amber-900"
                      : "bg-rose-200 text-rose-900"
                  }`}
                >
                  {customerKyc.digilockerStatus === "verified"
                    ? "Government Verified"
                    : customerKyc.digilockerStatus === "pending_review"
                    ? "Under Review"
                    : "Policy Alert"}
                </span>
              </div>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                {customerKyc.digilockerStatus === "verified"
                  ? `Indian DL (${customerKyc.drivingLicense.dlNumber}) & Masked Aadhaar (${customerKyc.aadhaar.maskedNumber}) authenticated via MoRTH Sarathi.`
                  : customerKyc.digilockerStatus === "pending_review"
                  ? `Credentials submitted for ${customerKyc.fullName}. Awaiting visual agent check for keyless dispatch approval.`
                  : customerKyc.reviewNotes || "Customer driving credentials require compliance review or document re-upload."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowKycModal(true)}
              className="flex-1 sm:flex-initial bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] font-bold text-xs py-2 px-3.5 rounded-xl shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              View Credential
            </button>
            <button
              type="button"
              onClick={handleStartDigiLocker}
              className="flex-1 sm:flex-initial bg-[#50644E] hover:bg-[#3F503D] text-white font-bold text-xs py-2 px-4 rounded-xl shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              {customerKyc.digilockerStatus === "verified"
                ? "Update DL"
                : "Connect DigiLocker"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#E1E8DF] pb-2 text-xs font-bold">
        {[
          { id: "overview", label: "My Rentals" },
          { id: "vault", label: "DigiLocker Document Vault" },
          { id: "documents", label: "Rental Agreements & Terms" },
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

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-extrabold text-sm text-[#172016]">
                        {formatINR(booking.total_amount_inr)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoice({
                            invoiceNumber: `INV-2026-${booking.booking_code.replace(/[^A-Z0-9]/gi, "").slice(-6)}`,
                            invoiceDate: new Date().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }),
                            bookingRef: booking.booking_code,
                            customerName: userDisplayName,
                            customerEmail: userEmail,
                            customerPhone: userPhone,
                            vehicleName: pass.carName,
                            vehicleRegistration: pass.registrationNumber,
                            hubLocation: pass.pickupLocation,
                            pickupDate: pass.pickupDate,
                            returnDate: pass.returnDate,
                            rentalDays: pass.days,
                            conditionTier: pass.conditionLabel,
                            baseDailyRateINR: Math.round((booking.total_amount_inr * 0.65) / pass.days),
                            baseRentalINR: Math.round(booking.total_amount_inr * 0.65),
                            platformFeeINR: Math.round(booking.total_amount_inr * 0.04),
                            damageProtectionINR: 1797,
                            protectionTierName: pass.protectionPlanName,
                            taxableSubtotalINR: Math.round(booking.total_amount_inr * 0.75),
                            cgstINR: Math.round(booking.total_amount_inr * 0.75 * 0.09),
                            sgstINR: Math.round(booking.total_amount_inr * 0.75 * 0.09),
                            totalTaxINR: Math.round(booking.total_amount_inr * 0.75 * 0.18),
                            fastagBufferINR: booking.fastag_buffer_inr || 1000,
                            fastagUsedINR: 240,
                            depositHeldINR: booking.security_deposit_inr || 5000,
                            depositRefundedINR: Math.max(0, (booking.security_deposit_inr || 5000) - 240),
                            totalPaidINR: booking.total_amount_inr,
                            paymentStatus: booking.status === "closed" ? "Settled & Refunded" : "Paid",
                          });
                        }}
                        className="bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="View GST Tax Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
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

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-extrabold text-sm text-[#172016]">
                  {activePass ? formatINR(activePass.totalPaidINR) : "₹67,497"} Total
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInvoice({
                      invoiceNumber: "INV-2026-HD8924",
                      invoiceDate: new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                      bookingRef: activePass?.bookingRef || "#HD-DEL-8924",
                      customerName: userDisplayName,
                      customerEmail: userEmail,
                      customerPhone: userPhone,
                      vehicleName: activePass?.carName || "Aston Martin Vantage V8",
                      vehicleRegistration: activePass?.registrationNumber || "DL-01-HD-2025",
                      hubLocation: activePass?.pickupLocation || "Aerocity Hub (IGI Airport)",
                      pickupDate: activePass?.pickupDate || "14 Nov 2026",
                      returnDate: activePass?.returnDate || "17 Nov 2026",
                      rentalDays: activePass?.days || 3,
                      conditionTier: activePass?.conditionLabel || "Executive Mint",
                      baseDailyRateINR: 19499,
                      baseRentalINR: 58497,
                      platformFeeINR: 2925,
                      damageProtectionINR: 3897,
                      protectionTierName: "Peace of Mind Zero-Liability",
                      taxableSubtotalINR: 65319,
                      cgstINR: 5879,
                      sgstINR: 5879,
                      totalTaxINR: 11758,
                      fastagBufferINR: 2000,
                      fastagUsedINR: 450,
                      depositHeldINR: 15000,
                      depositRefundedINR: 14550,
                      totalPaidINR: 94077,
                      paymentStatus: "Paid",
                    });
                  }}
                  className="bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
                <Link
                  href="/ride?tab=pass"
                  className="bg-[#50644E] text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#3F503D] transition-colors"
                >
                  View Live Pass →
                </Link>
              </div>
            </div>
          )}

          {/* Past Completed & Settled Trip Card */}
          <div className="bg-[#F8FAF7] rounded-2xl p-5 border border-[#E8EFE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-gray-500 flex items-center justify-center shrink-0 border border-[#E8EFE5]">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#172016]">
                    Mahindra Thar Roxx 4x4 AX7L
                  </h4>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">
                    Completed &amp; Settled
                  </span>
                </div>
                <p className="text-xs text-[#5C6B5A] mt-0.5">
                  20 Oct 2026 – 23 Oct 2026 (3 Days) • Cyber Hub DLF Phase 2, Gurugram
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Deposit Refund: ₹4,760 credited back (FASTag toll ₹240 deducted)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="font-mono font-bold text-xs text-[#5C6B5A]">#HD-DEL-4190</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice({
                    invoiceNumber: "INV-2026-HD4190",
                    invoiceDate: "23 Oct 2026",
                    bookingRef: "#HD-DEL-4190",
                    customerName: userDisplayName,
                    customerEmail: userEmail,
                    customerPhone: userPhone,
                    vehicleName: "Mahindra Thar Roxx 4x4 AX7L",
                    vehicleRegistration: "HR-26-HD-4190",
                    hubLocation: "Cyber Hub DLF Phase 2, Gurugram",
                    pickupDate: "20 Oct 2026",
                    returnDate: "23 Oct 2026",
                    rentalDays: 3,
                    conditionTier: "Showroom Pristine",
                    baseDailyRateINR: 5174,
                    baseRentalINR: 15522,
                    platformFeeINR: 776,
                    damageProtectionINR: 1797,
                    protectionTierName: "Smart Protection Plan",
                    taxableSubtotalINR: 18095,
                    cgstINR: 1629,
                    sgstINR: 1629,
                    totalTaxINR: 3258,
                    fastagBufferINR: 1000,
                    fastagUsedINR: 240,
                    depositHeldINR: 5000,
                    depositRefundedINR: 4760,
                    totalPaidINR: 27353,
                    paymentStatus: "Settled & Refunded",
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>GST Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DIGILOCKER DOCUMENT VAULT */}
      {activeSubSection === "vault" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#50644E]" />
                <h3 className="text-lg font-black text-[#172016] tracking-tight">
                  Verified Identity &amp; Government Credentials
                </h3>
              </div>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                MoRTH Sarathi &amp; UIDAI DigiLocker integration enables keyless, zero-contact self-drive dispatch across Delhi NCR.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartDigiLocker}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#50644E] hover:bg-[#3F503D] transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-authenticate DigiLocker</span>
              </button>
            </div>
          </div>

          {/* Smart Card Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Indian Driving License Digital Smart Card */}
            <div className="bg-gradient-to-br from-[#172016] via-[#243322] to-[#172016] text-white p-6 rounded-[28px] shadow-homie border border-white/10 space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Gold Chip & Emblem Header */}
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div>
                    <span className="text-[10px] text-[#A2BA9F] uppercase font-bold tracking-wider block">
                      Govt. of NCT of Delhi • Transport Dept
                    </span>
                    <span className="text-sm font-black tracking-wide text-white">
                      INDIAN DRIVING LICENSE (SMART CARD)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {customerKyc.drivingLicense.vehicleClasses[0] || "LMV-NT"}
                    </span>
                  </div>
                </div>

                {/* EMV Microchip Graphic */}
                <div className="my-3 flex items-center justify-between">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 shadow-xs flex items-center justify-center p-0.5">
                    <div className="w-full h-full border border-amber-700/40 rounded-2xs grid grid-cols-2 gap-0.5 opacity-80" />
                  </div>
                  <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase">
                    Sarathi 4.0 Authenticated
                  </span>
                </div>

                {/* DL Details */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-white/50 block">Driving License Number</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-base text-emerald-300 tracking-wide">
                        {customerKyc.drivingLicense.dlNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDl(customerKyc.drivingLicense.dlNumber)}
                        className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy DL Number"
                      >
                        {copiedDl ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-[10px] text-white/50 block">Licensee Full Name</span>
                      <strong className="text-white text-xs">{customerKyc.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/50 block">Authorized Classes</span>
                      <span className="text-white font-medium">
                        {customerKyc.drivingLicense.vehicleClasses.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/50 block">Issuing Authority (RTO)</span>
                      <span className="text-white text-[11px] leading-tight">
                        {customerKyc.drivingLicense.issuingRTO}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/50 block">Valid Until</span>
                      <span className="text-emerald-300 font-bold">
                        {customerKyc.drivingLicense.expiryDate} (Active)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>DigiLocker MoRTH Verified</span>
                </span>
                <span className="font-mono text-white/50">HMAC-SHA256 Match</span>
              </div>
            </div>

            {/* 2. UIDAI Masked Aadhaar Digital Credential */}
            <div className="bg-white p-6 rounded-[28px] shadow-sm border border-[#E8EFE5] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F0F4ED] pb-3">
                  <div>
                    <span className="text-[10px] text-[#829280] uppercase font-bold tracking-wider block">
                      Unique Identification Authority of India
                    </span>
                    <span className="text-sm font-black tracking-wide text-[#172016]">
                      AADHAAR IDENTITY VERIFICATION
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#EAF0E7] text-[#50644E] font-extrabold px-2 py-0.5 rounded-full border border-[#D5E2D1]">
                    UIDAI Authenticated
                  </span>
                </div>

                <div className="my-3 p-3 bg-[#F8FAF7] rounded-xl border border-[#E8EFE5] space-y-1">
                  <span className="text-[10px] font-bold text-[#829280] uppercase tracking-wider block">
                    Masked Aadhaar Number
                  </span>
                  <div className="font-mono font-black text-lg text-[#172016] tracking-wider">
                    {customerKyc.aadhaar.maskedNumber}
                  </div>
                  <p className="text-[10px] text-[#5C6B5A]">
                    Privacy First: Only last 4 digits are cryptographically reconciled. Zero raw UID stored.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#829280] block">Date of Birth &amp; Age</span>
                    <strong className="text-[#172016]">
                      {customerKyc.aadhaar.dob} ({customerKyc.aadhaar.age} Years)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#829280] block">Age Eligibility Check</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>23+ Luxury Qualified</span>
                    </span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-[10px] text-[#829280] block">Permanent NCR Address</span>
                    <span className="text-[#172016] text-[11px]">
                      {customerKyc.aadhaar.address}, {customerKyc.aadhaar.city} - {customerKyc.aadhaar.pincode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0F4ED] flex items-center justify-between text-[11px] text-[#5C6B5A]">
                <span>Self-Drive Authorization:</span>
                <span className="font-bold text-emerald-800">Unrestricted Delhi NCR</span>
              </div>
            </div>
          </div>

          {/* Physical Document Capture / Camera Photo Backup */}
          <div className="bg-white rounded-[28px] p-6 border border-[#E8EFE5] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#172016] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#50644E]" />
                  <span>Physical Driving License Photo (On-File Inspection Backup)</span>
                </h4>
                <p className="text-xs text-[#5C6B5A] mt-0.5">
                  High-resolution photo retained for instantaneous optical matching by hub agents during keyless handover.
                </p>
              </div>

              {userDlImage || customerKyc.drivingLicense.cardImageUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                  <CheckCircle className="w-3 h-3" />
                  <span>Document Stored Securely</span>
                </span>
              ) : null}
            </div>

            {userDlImage || customerKyc.drivingLicense.cardImageUrl ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 relative rounded-2xl overflow-hidden border border-[#CAD8C6] bg-black/5 aspect-video max-h-48 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userDlImage || customerKyc.drivingLicense.cardImageUrl || ""}
                    alt="Physical Driver License"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-xs">
                    DIGILOCKER SYNCED
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="w-full py-2.5 px-3 rounded-xl border border-[#CAD8C6] hover:bg-[#F3F6F1] text-xs font-bold text-[#50644E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDlImageFile}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-[#829280] leading-relaxed">
                    Accepted: JPG, PNG, WEBP. Front-facing clear photo with visible RTO stamp and watermark.
                  </p>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#CFD8CD] hover:border-[#50644E] hover:bg-[#F8FAF7] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                <div className="w-10 h-10 rounded-full bg-[#EAF0E7] text-[#50644E] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#172016] block">
                    Upload Physical Driving License Photo
                  </span>
                  <span className="text-[11px] text-[#829280]">
                    Drag &amp; drop or click to browse • Automatically encrypted &amp; stored to your profile
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDlImageFile}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Compliance & Regulatory Guarantees Notice */}
          <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#DFE6DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5C6B5A]">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#50644E] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#172016] block">
                  Digital Personal Data Protection (DPDP) Act 2023 Compliant
                </strong>
                <span>
                  All driving licenses and identity documents are encrypted end-to-end and strictly accessed for booking compliance and insurance coverage in Delhi NCR.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Verification Certificate: Authenticated by Homie Drives Fleet Operations via MoRTH Sarathi Gateway.")}
              className="text-[#50644E] font-bold hover:underline shrink-0 text-xs"
            >
              Download Verification Certificate →
            </button>
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
            <a
              href="tel:+918448786016"
              className="bg-[#F8FAF7] hover:bg-[#F0F4ED] p-4 rounded-xl border border-[#E8EFE5] transition-all block group"
            >
              <Phone className="w-5 h-5 text-[#50644E] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#172016]">Direct Booking &amp; Roadside Hotline</h4>
              <p className="text-[#50644E] font-bold mt-0.5 font-mono text-sm">+91 84487 86016</p>
              <p className="text-[11px] text-[#829280] mt-1">Tap to call our 24x7 Delhi NCR fleet concierge</p>
            </a>

            <a
              href="https://wa.me/918448786016?text=Hi%20Homie%20Drives%2C%20I%20need%20assistance%20or%20would%20like%20to%20book%20a%20car."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F8FAF7] hover:bg-[#F0F4ED] p-4 rounded-xl border border-[#E8EFE5] transition-all block group"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#172016]">WhatsApp Fleet Concierge</h4>
              <p className="text-[#075E54] font-bold mt-0.5 font-mono text-sm">+91 84487 86016</p>
              <p className="text-[11px] text-[#829280] mt-1">Chat for instant bookings, extensions &amp; hub dispatch</p>
            </a>
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
                  {customerKyc.drivingLicense.vehicleClasses[0] || "LMV-NT"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block">DL Number</span>
                  <span className="font-mono font-bold text-sm text-emerald-300">
                    {customerKyc.drivingLicense.dlNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[10px] text-white/50 block">Licensee</span>
                    <strong className="text-white">{customerKyc.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Aadhaar (UIDAI)</span>
                    <span className="font-mono text-emerald-300">
                      {customerKyc.aadhaar.maskedNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Date of Birth &amp; Age</span>
                    <span className="text-white">
                      {customerKyc.aadhaar.dob} ({customerKyc.aadhaar.age} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Valid Until</span>
                    <span className="text-white">{customerKyc.drivingLicense.expiryDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-white/50 block">Issuing Authority</span>
                    <span className="text-white">{customerKyc.drivingLicense.issuingRTO}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
                <span>Cryptographically Authenticated</span>
                <span className="text-emerald-400 font-bold">SHA-256 DigiLocker Match</span>
              </div>
            </div>

            {/* If user uploaded physical DL card photo, preview it here */}
            {(customerKyc.drivingLicense.cardImageUrl || userDlImage) && (
              <div className="p-3 bg-[#F8FAF7] rounded-2xl border border-[#DFE6DC] space-y-1.5">
                <span className="text-[11px] font-bold text-[#172016] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#50644E]" />
                  <span>Physical DL Photo Attached</span>
                </span>
                <div className="relative rounded-xl overflow-hidden border border-[#CFD8CD] bg-black/5 aspect-video max-h-36 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customerKyc.drivingLicense.cardImageUrl || userDlImage || ""}
                    alt="Physical DL Verification"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      DigiLocker Verified Card
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                customerKyc.aadhaar.ageCheckPassed
                  ? "bg-[#F8FAF7] text-[#5C6B5A]"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {customerKyc.aadhaar.ageCheckPassed ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                {customerKyc.aadhaar.ageCheckPassed
                  ? "Eligible for all Homie Drives luxury SUVs, city EVs, and supercars in Delhi NCR."
                  : "Policy Notice: Homie Drives minimum self-drive requirement is 23+ years."}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowKycModal(false);
                  handleStartDigiLocker();
                }}
                className="flex-1 py-2.5 rounded-full bg-white text-[#50644E] border border-[#CAD8C6] hover:bg-[#F3F6F1] font-bold text-xs transition-colors cursor-pointer"
              >
                Re-link or Update
              </button>
              <button
                type="button"
                onClick={() => setShowKycModal(false)}
                className="flex-1 py-2.5 rounded-full bg-[#50644E] text-white font-bold text-xs hover:bg-[#3F503D] transition-colors cursor-pointer"
              >
                Close Credential
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive DigiLocker Connect & Verification Modal */}
      {showDigiLockerFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-homie-lg border border-[#E1E8DF] relative space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F4ED]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF0E7] flex items-center justify-center text-[#50644E]">
                  <FileBadge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#172016] flex items-center gap-2">
                    <span>DigiLocker Driver Verification</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Step {digiLockerStep} of 3
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#5C6B5A]">
                    Govt. of India Digital Locker • MoRTH Sarathi &amp; UIDAI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDigiLockerFlowModal(false);
                  setKycSubmitFeedback(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: Enter License & Phone */}
            {digiLockerStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] text-xs text-[#5C6B5A] space-y-1">
                  <p className="font-bold text-[#172016]">Instant Driver Credential Fetch</p>
                  <p>
                    DigiLocker connects with MoRTH Sarathi to verify your Indian Driving License and checks 23+ self-drive eligibility.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#172016] block mb-1">
                      Full Legal Name (as per Driving License)
                    </label>
                    <input
                      type="text"
                      required
                      value={digiLockerFullName}
                      onChange={(e) => setDigiLockerFullName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] font-medium text-[#172016] outline-hidden bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#172016] block mb-1">
                        Registered Mobile (+91)
                      </label>
                      <input
                        type="tel"
                        required
                        value={digiLockerPhone}
                        onChange={(e) => setDigiLockerPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] font-mono text-[#172016] outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#172016] block mb-1">
                        Aadhaar Number / Token
                      </label>
                      <input
                        type="text"
                        required
                        value={digiLockerAadhaar}
                        onChange={(e) => setDigiLockerAadhaar(e.target.value)}
                        placeholder="XXXX-XXXX-8492"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] font-mono text-[#172016] outline-hidden bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#172016] block mb-1">
                      Indian Driving License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={digiLockerDlNumber}
                      onChange={(e) => setDigiLockerDlNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. DL-04-2018-0091823"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] font-mono font-bold text-[#172016] outline-hidden bg-white"
                    />
                    <p className="text-[10px] text-[#829280] mt-1">
                      Valid Delhi, UP, or Haryana State RTO license required.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDigiLockerFlowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingDigiLocker}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingDigiLocker ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Request DigiLocker OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter Aadhaar OTP */}
            {digiLockerStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>DigiLocker OTP Dispatched</span>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    A 6-digit authentication OTP was sent to your Aadhaar-linked mobile ending in {digiLockerPhone.slice(-4) || "4567"}.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#172016] block">
                    Enter Verification OTP
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={digiLockerOtp}
                      onChange={(e) => setDigiLockerOtp(e.target.value)}
                      placeholder="8924"
                      className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] outline-hidden bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5C6B5A]">
                    <span>Sandbox Demo OTP: <strong>8924</strong></span>
                    <button
                      type="button"
                      onClick={() => setDigiLockerOtp("8924")}
                      className="text-[#50644E] font-bold hover:underline cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setDigiLockerStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingDigiLocker || !digiLockerOtp}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingDigiLocker ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying MoRTH Token...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Fetch Records</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Review Fetched Records & Attach Optional Card Photo */}
            {digiLockerStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#E8EFE5] pb-2">
                    <span className="font-bold text-[#172016]">Fetched MoRTH Sarathi Record</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Cryptographically Validated
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#829280] block text-[10px]">Licensee</span>
                      <strong className="text-[#172016]">{digiLockerFullName}</strong>
                    </div>
                    <div>
                      <span className="text-[#829280] block text-[10px]">Aadhaar Masked</span>
                      <span className="font-mono text-[#172016]">
                        XXXXXXXX{digiLockerAadhaar.replace(/\D/g, "").slice(-4) || "8492"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#829280] block text-[10px]">DL Number</span>
                      <span className="font-mono font-bold text-[#172016]">{digiLockerDlNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#829280] block text-[10px]">Class &amp; Expiry</span>
                      <span className="text-[#172016]">LMV-NT • 13-May-2038</span>
                    </div>
                  </div>

                  {/* 23+ Policy Status Banner */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-[11px] font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>23+ Policy Passed: Eligible for Self-Drive Fleet Dispatch</span>
                  </div>
                </div>

                {/* Optional Physical Card Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                    <span>Physical Driving License Photo (Optional)</span>
                    <span className="text-[10px] text-[#829280]">Backing proof for dispatch agent</span>
                  </label>
                  <label className="flex items-center justify-center p-4 border-2 border-dashed border-[#CFD8CD] hover:border-[#50644E] rounded-2xl cursor-pointer bg-[#FAFBF9] transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDigiLockerImageUpload}
                      className="hidden"
                    />
                    <div className="text-center text-xs space-y-1">
                      <Camera className="w-5 h-5 text-[#829280] group-hover:text-[#50644E] mx-auto transition-colors" />
                      <span className="font-semibold text-[#50644E] block">
                        {digiLockerUploadedImage ? "Photo Selected (Click to change)" : "Upload or Take DL Card Photo"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Feedback */}
                {kycSubmitFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      kycSubmitFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {kycSubmitFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{kycSubmitFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setDigiLockerStep(2)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSubmitKyc}
                    disabled={isVerifyingDigiLocker}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingDigiLocker ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Profile...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Link to Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Edit Profile Modal Dialog */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DFE6DC] relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setShowEditProfileModal(false);
                setProfileFeedback(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F3F6F1] text-[#829280] hover:text-[#172016] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#50644E]/10 flex items-center justify-center text-[#50644E]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#172016]">
                  Edit Profile Details
                </h3>
                <p className="text-xs text-[#5C6B5A]">
                  Update your contact and driving verification credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172016]">Full Name</label>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172016]">
                  Indian Mobile Number (+91)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-bold font-mono text-[#172016] outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172016]">
                  Driving License Number (DL)
                </label>
                <input
                  type="text"
                  value={dlInput}
                  onChange={(e) => setDlInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-mono font-bold text-[#172016] outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172016]">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={emergencyInput}
                  onChange={(e) => setEmergencyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                  placeholder="+91 84487 86016"
                />
              </div>

              {/* Physical DL Card Photo Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#50644E]" />
                    <span>Driving License Front Card Photo</span>
                  </span>
                  {dlImageInput && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Photo Added
                    </span>
                  )}
                </label>

                {dlImageInput ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#CAD8C6] bg-black/5 aspect-video max-h-36 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dlImageInput}
                      alt="Driving License Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setDlImageInput(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#CFD8CD] hover:border-[#50644E] hover:bg-[#F3F6F1] rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                    <Upload className="w-4 h-4 text-[#50644E]" />
                    <span className="text-xs font-bold text-[#172016]">
                      Upload DL front image
                    </span>
                    <span className="text-[10px] text-[#829280]">
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDlImageFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {profileFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    profileFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileFeedback.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{profileFeedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#F0F4ED]">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#50644E] hover:bg-[#3F503D] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GST Tax Invoice & Settlement Receipt Modal */}
      {selectedInvoice && (
        <TaxInvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          data={selectedInvoice}
        />
      )}
    </div>
  );
}
