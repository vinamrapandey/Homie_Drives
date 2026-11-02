"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/supabase/auth";
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "phone" | "email";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "phone",
}) => {
  const { sendPhoneOtp, verifyPhoneOtp, sendEmailOtp, verifyEmailOtp } = useAuth();

  const [authMethod, setAuthMethod] = useState<"phone" | "email">(initialMode);
  const [step, setStep] = useState<"input" | "otp" | "success">("input");

  // Phone states
  const [phone, setPhone] = useState("");
  // Email states
  const [email, setEmail] = useState("");

  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (authMethod === "phone") {
        const clean = phone.replace(/\D/g, "");
        if (clean.length < 10) {
          throw new Error("Please enter a valid 10-digit Indian mobile number.");
        }
        await sendPhoneOtp(clean);
      } else {
        if (!email || !email.includes("@")) {
          throw new Error("Please enter a valid email address.");
        }
        await sendEmailOtp(email.trim());
      }
      setStep("otp");
      setCountdown(30);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send verification code. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpToken.trim().length < 4) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (authMethod === "phone") {
        await verifyPhoneOtp(phone.trim(), otpToken.trim());
      } else {
        await verifyEmailOtp(email.trim(), otpToken.trim());
      }
      setStep("success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        handleReset();
      }, 1400);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code. Use demo code 8924 to proceed.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setOtpToken("");
    setErrorMessage(null);
  };

  const fillDemoOtp = () => {
    setOtpToken("8924");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl border border-[#DFE6DC] shadow-2xl w-full max-w-md p-6 sm:p-8 z-10 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F3F6F1] text-[#5C6B5A] transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xs shrink-0 bg-[#F3F6F1] p-1 border border-[#E8EFE5]">
            <Image
              src="/images/logo/homie_drives.png"
              alt="Homie Drives"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#172016]">
              {step === "input" && "Sign In to Homie Drives"}
              {step === "otp" && "Enter Verification OTP"}
              {step === "success" && "Verification Complete"}
            </h3>
            <p className="text-xs text-[#5C6B5A]">
              {step === "input" && "Access your digital pass & verified driving profile"}
              {step === "otp" && (authMethod === "phone" ? `SMS code sent to +91 ${phone.slice(-10)}` : `Code sent to ${email}`)}
              {step === "success" && "Welcome aboard • Session active"}
            </p>
          </div>
        </div>

        {/* Auth Method Switcher (Phone vs Email) */}
        {step === "input" && (
          <div className="grid grid-cols-2 p-1 bg-[#F3F6F1] rounded-2xl border border-[#E8EFE5] mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "phone"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP (+91)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "email"
                  ? "bg-[#50644E] text-white shadow-xs"
                  : "text-[#5C6B5A] hover:text-[#172016]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Magic Link</span>
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Input Form */}
        {step === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {authMethod === "phone" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172016] block">
                  Indian Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-xs font-extrabold text-[#172016] pr-2 border-r border-[#DFE6DC] pointer-events-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    maxLength={10}
                    required
                    autoFocus
                    className="w-full pl-20 pr-4 py-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-sm font-bold text-[#172016] placeholder:text-[#829280] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30 font-mono tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-[#829280] pt-0.5">
                  We&apos;ll send an instant 6-digit SMS OTP to verify your identity.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172016] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#829280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-sm text-[#172016] placeholder:text-[#829280] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (authMethod === "phone" ? phone.length < 10 : !email)}
              className="w-full bg-[#50644E] hover:bg-[#3D4D3B] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center space-y-2">
              <span className="text-[11px] text-[#829280] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#50644E]" />
                Protected by Digilocker KYC &amp; Supabase Auth
              </span>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#172016]">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={fillDemoOtp}
                  className="text-[11px] font-bold text-[#50644E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Use Demo Code: 8924</span>
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                required
                autoFocus
                className="w-full text-center text-3xl font-mono tracking-[0.35em] py-3.5 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-[#172016] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpToken.length < 4}
              className="w-full bg-[#50644E] hover:bg-[#3D4D3B] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#5C6B5A] pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="hover:underline text-[#50644E] font-medium cursor-pointer"
              >
                Change {authMethod === "phone" ? "mobile number" : "email"}
              </button>
              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleSendOtp}
                className="hover:underline text-[#829280] disabled:opacity-50 cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <p className="font-extrabold text-base text-[#172016]">
                Signed In Successfully
              </p>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                {authMethod === "phone" ? `Mobile: +91 ${phone.slice(-10)}` : `Email: ${email}`}
              </p>
            </div>
            <p className="text-[11px] text-[#829280] pt-1">Syncing active rental passes...</p>
          </div>
        )}

        {/* Bottom Hotline Helper */}
        <div className="mt-5 pt-4 border-t border-[#F0F4ED] flex items-center justify-between text-[11px] text-[#5C6B5A]">
          <span>Need help signing in?</span>
          <a
            href="tel:+918448786016"
            className="font-bold text-[#50644E] hover:underline flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>Call Hotline: 8448786016</span>
          </a>
        </div>
      </div>
    </div>
  );
};
