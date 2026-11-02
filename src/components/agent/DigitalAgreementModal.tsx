"use client";

import React, { useRef, useState, useEffect } from "react";
import { formatINR } from "@/lib/formatters";
import {
  FileText,
  PenTool,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  Car,
  User,
  Printer,
  Download,
  Check,
} from "lucide-react";

interface DigitalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  customerName: string;
  customerPhone?: string;
  vehicleName: string;
  registrationNumber?: string;
  hubLocation: string;
  pickupDate: string;
  returnDate: string;
  onSignComplete?: (signatureDataUrl: string) => void;
}

export const DigitalAgreementModal: React.FC<DigitalAgreementModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  customerName,
  customerPhone = "+91 98765 43210",
  vehicleName,
  registrationNumber = "DL-01-HD-8924",
  hubLocation,
  pickupDate,
  returnDate,
  onSignComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Initialize canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#172016";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Touch and mouse drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignatureSaved(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureSaved(dataUrl);
    if (onSignComplete) {
      onSignComplete(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[32px] p-6 sm:p-8 shadow-homie-lg border border-[#E1E8DF] relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF0E7] text-[#50644E] flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#50644E] block">
                Homie Drives Legal Framework
              </span>
              <h3 className="text-lg font-black text-[#172016] tracking-tight">
                Digital Rental Agreement &amp; Handover Mandate
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6F1] hover:bg-[#EAF0E7] flex items-center justify-center text-[#5C6B5A] hover:text-[#172016] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contract Parties & Vehicle Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAF7] p-3.5 rounded-2xl border border-[#E8EFE5] text-xs">
          <div>
            <span className="text-[10px] text-[#829280] block font-bold">Booking Reference</span>
            <strong className="font-mono text-[#172016]">{bookingCode}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#829280] block font-bold">Hirer / Customer</span>
            <strong className="text-[#172016]">{customerName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#829280] block font-bold">Allocated Vehicle</span>
            <span className="text-[#172016] font-semibold">{vehicleName}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#829280] block font-bold">Registration Mark</span>
            <span className="font-mono font-bold text-emerald-800">{registrationNumber}</span>
          </div>
        </div>

        {/* Core Agreement Clauses (Delhi NCR Standard) */}
        <div className="bg-[#FAFBF9] border border-[#E8EFE5] rounded-2xl p-4 text-xs space-y-2.5 max-h-52 overflow-y-auto">
          <h4 className="font-bold text-[#172016] uppercase text-[11px] tracking-wider">
            Mandatory Operational Clauses &amp; Terms
          </h4>
          <ol className="list-decimal pl-4 space-y-1.5 text-[#5C6B5A] leading-relaxed">
            <li>
              <strong>Authorized Handover:</strong> The Hirer acknowledges having physically inspected the vehicle at <strong>{hubLocation}</strong>. The odometer reading and fuel/battery state have been verified on the digital pass.
            </li>
            <li>
              <strong>Geographical Limits:</strong> Authorized self-drive is restricted to sovereign territory of India with primary coverage in Delhi NCR, Haryana, Uttar Pradesh, Rajasthan, and Uttarakhand expressways.
            </li>
            <li>
              <strong>FASTag Electronic Tolls:</strong> All highway toll plaza transactions are electronically recorded via the vehicle&apos;s pre-linked Delhi FASTag wallet and reconciled against the security escrow.
            </li>
            <li>
              <strong>Return Protocol:</strong> The vehicle must be returned to <strong>{hubLocation}</strong> on or before <strong>{returnDate}</strong>. Excess delay beyond 2 hours without extension authorization incurs standardized hourly charges.
            </li>
            <li>
              <strong>Substance &amp; Commercial Prohibition:</strong> Smoking, carriage of contraband, and commercial sub-leasing are strictly prohibited under the Motor Vehicles Act (1988).
            </li>
          </ol>
        </div>

        {/* E-Signature Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#172016] flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-[#50644E]" />
              <span>Customer Digital Signature (Sign Below on Screen / Touchpad)</span>
            </label>
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-[#5C6B5A] hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Canvas</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-[#CFD8CD] rounded-2xl bg-white p-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={560}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 bg-white cursor-crosshair touch-none rounded-xl"
            />
            {!hasSigned && !signatureSaved && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-gray-400 font-medium">
                Draw signature here with mouse, stylus or finger
              </div>
            )}
          </div>
        </div>

        {/* Agreement Acceptance Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-xs text-[#5C6B5A]">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#50644E] rounded border-gray-300 focus:ring-[#50644E]"
            />
            <span className="leading-snug">
              I, <strong>{customerName}</strong>, hereby declare that the driving license submitted is valid, I consent to the terms of the Master Rental Agreement, and authorize electronic verification of this contract.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0F4ED]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#DFE6DC] text-xs font-semibold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!hasSigned || !agreedToTerms}
            onClick={() => {
              saveSignature();
              setTimeout(() => onClose(), 600);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#50644E] hover:bg-[#3F503D] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete E-Sign &amp; Ratify Agreement</span>
          </button>
        </div>
      </div>
    </div>
  );
};

