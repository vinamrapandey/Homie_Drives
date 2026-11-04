"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default true until mounted check

  useEffect(() => {
    // 1. Check if already installed / running in standalone PWA mode
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (checkStandalone) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if user dismissed prompt in this session
    const dismissed = sessionStorage.getItem("homie_pwa_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // 4. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("homie_pwa_dismissed", "true");
  };

  // If running as an installed standalone app or dismissed, don't display
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only render on Chromium if prompt captured, or on iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#172016] text-white p-4 rounded-[24px] shadow-homie-lg border border-[#2D3A2B] flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#50644E]/30 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-2xl bg-white p-1 border border-white/20 shrink-0 overflow-hidden shadow-sm">
            <Image
              src="/images/logo/homie_drives.png"
              alt="Homie Drives"
              fill
              className="object-contain p-0.5"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-white truncate">
                Install Homie Drives App
              </h4>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#A2BA9F] truncate mt-0.5">
              {isIOS
                ? "Tap Share ⎋ then 'Add to Home Screen' ⊞"
                : "1-Tap smart remote key fob & offline digital passes"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss installation banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
