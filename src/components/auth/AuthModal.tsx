"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/supabase/auth";
import { X, Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { sendEmailOtp, verifyEmailOtp } = useAuth();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await sendEmailOtp(email.trim());
      setStep("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send code. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpToken.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await verifyEmailOtp(email.trim(), otpToken.trim());
      setStep("success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired code. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("email");
    setOtpToken("");
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl border border-[#DFE6DC] shadow-homie-lg w-full max-w-md p-6 sm:p-8 z-10 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F3F6F1] text-[#5C6B5A] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#50644E] flex items-center justify-center text-white shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#172016]">
              {step === "email" && "Sign in to Homie Drives"}
              {step === "otp" && "Enter Verification Code"}
              {step === "success" && "Verification Successful"}
            </h3>
            <p className="text-xs text-[#5C6B5A]">
              {step === "email" && "Fast passwordless access for verified bookings"}
              {step === "otp" && `Code sent to ${email}`}
              {step === "success" && "Welcome to Homie Drives"}
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172016] block">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#829280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-sm text-[#172016] placeholder:text-[#829280] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#50644E] hover:bg-[#3F503D] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-[#829280] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#50644E]" />
                Zero password friction • Supabase Auth Security
              </span>
            </div>
          </form>
        )}

        {/* Step 2: 6-Digit OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172016] block">
                6-Digit Security Token
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                autoFocus
                className="w-full text-center text-2xl font-mono tracking-widest py-3 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-[#172016] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpToken.length < 6}
              className="w-full bg-[#50644E] hover:bg-[#3F503D] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#5C6B5A] pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="hover:underline text-[#50644E] font-medium"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="hover:underline text-[#829280]"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-bold text-[#172016]">Authenticated as {email}</p>
            <p className="text-xs text-[#5C6B5A]">Redirecting to your session...</p>
          </div>
        )}
      </div>
    </div>
  );
};

