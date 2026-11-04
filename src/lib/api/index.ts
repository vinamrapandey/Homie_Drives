/**
 * Homie Drives — Third-Party API Gateway Index
 *
 * Centralized gateway configuration and adapter barrel.
 * Inspects environment variables dynamically without hardcoded secrets.
 */

export * from "./digilocker";
export * from "./payment";
export * from "./comms";

import { isDigiLockerLiveConfigured } from "./digilocker";
import { isPaymentGatewayLiveConfigured } from "./payment";
import { isCommsGatewayLiveConfigured } from "./comms";

export interface GatewayIntegrationStatus {
  service: string;
  category: "kyc" | "payment" | "comms" | "maps";
  status: "live" | "sandbox";
  configuredKeys: string[];
  missingKeys: string[];
  providerLabel: string;
}

/**
 * Returns a diagnostic overview of all 4 major third-party integration pipelines.
 */
export function getGatewayIntegrationsStatus(): GatewayIntegrationStatus[] {
  const hasGoogleMaps = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
  const hasDigiLocker = isDigiLockerLiveConfigured();
  const hasPayment = isPaymentGatewayLiveConfigured();
  const hasComms = isCommsGatewayLiveConfigured();

  return [
    {
      service: "Google Maps Platform",
      category: "maps",
      status: hasGoogleMaps ? "live" : "sandbox",
      configuredKeys: hasGoogleMaps ? ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"] : [],
      missingKeys: hasGoogleMaps ? [] : ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
      providerLabel: hasGoogleMaps
        ? "Google Maps JavaScript SDK"
        : "Interactive Regional Vector Engine (Zero-Config Fallback)",
    },
    {
      service: "Govt. DigiLocker & MoRTH Sarathi",
      category: "kyc",
      status: hasDigiLocker ? "live" : "sandbox",
      configuredKeys: [
        process.env.SETU_DIGILOCKER_CLIENT_ID ? "SETU_DIGILOCKER_CLIENT_ID" : null,
        process.env.SUREPASS_API_TOKEN ? "SUREPASS_API_TOKEN" : null,
      ].filter(Boolean) as string[],
      missingKeys: hasDigiLocker
        ? []
        : ["SETU_DIGILOCKER_CLIENT_ID", "SETU_DIGILOCKER_CLIENT_SECRET (or SUREPASS_API_TOKEN)"],
      providerLabel: hasDigiLocker
        ? "Setu / SurePass MoRTH Gateway"
        : "Deterministic DigiLocker Government Sandbox",
    },
    {
      service: "Payment & Security Deposit Escrow",
      category: "payment",
      status: hasPayment ? "live" : "sandbox",
      configuredKeys: [
        process.env.RAZORPAY_KEY_ID ? "RAZORPAY_KEY_ID" : null,
        process.env.CASHFREE_APP_ID ? "CASHFREE_APP_ID" : null,
      ].filter(Boolean) as string[],
      missingKeys: hasPayment
        ? []
        : ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET (or CASHFREE_APP_ID)"],
      providerLabel: hasPayment
        ? "Razorpay Payments & Escrow Payouts"
        : "Deterministic Pre-Auth Settlement Sandbox",
    },
    {
      service: "Transactional Comms & WhatsApp",
      category: "comms",
      status: hasComms ? "live" : "sandbox",
      configuredKeys: [
        process.env.TWILIO_ACCOUNT_SID ? "TWILIO_ACCOUNT_SID" : null,
        process.env.GUPSHUP_API_KEY ? "GUPSHUP_API_KEY" : null,
      ].filter(Boolean) as string[],
      missingKeys: hasComms
        ? []
        : ["TWILIO_ACCOUNT_SID (or GUPSHUP_API_KEY)"],
      providerLabel: hasComms
        ? "Twilio / Gupshup WhatsApp Enterprise"
        : "Deterministic In-App Notification Center Stream",
    },
  ];
}

