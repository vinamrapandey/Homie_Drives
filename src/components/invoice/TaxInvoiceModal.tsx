"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/formatters";
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Receipt,
  Car,
} from "lucide-react";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleName: string;
  vehicleRegistration: string;
  hubLocation: string;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  conditionTier?: string;
  baseDailyRateINR: number;
  baseRentalINR: number;
  platformFeeINR: number;
  damageProtectionINR: number;
  protectionTierName?: string;
  taxableSubtotalINR: number;
  cgstINR: number;
  sgstINR: number;
  totalTaxINR: number;
  fastagBufferINR: number;
  fastagUsedINR?: number;
  depositHeldINR: number;
  depositRefundedINR?: number;
  totalPaidINR: number;
  paymentStatus: "Paid" | "Settled & Refunded";
}

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Top Bar (Non-printable) */}
        <div className="p-4 sm:p-5 bg-[#172016] text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                GST Tax Invoice &amp; Settlement Statement
              </h3>
              <p className="text-[11px] text-white/60 font-mono">
                {data.invoiceNumber} • SAC 996601
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div
          ref={invoiceRef}
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#172016] print:p-0 print:space-y-4 print:text-xs"
        >
          {/* Header & Brand Identity */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E8EFE5]">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F6F1] p-1 border border-[#E8EFE5] overflow-hidden shrink-0">
                  <Image
                    src="/images/logo/homie_drives.png"
                    alt="Homie Drives"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#172016]">
                    HOMIE DRIVES MOBILITY PVT. LTD.
                  </h2>
                  <p className="text-xs text-[#5C6B5A]">
                    Curated Fleet &amp; Flexible Vehicle Access
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[#5C6B5A] space-y-0.5 leading-relaxed pt-1">
                <p>Corporate Office: Aerocity Gateway Tower, New Delhi 110037</p>
                <p>
                  <strong className="text-[#172016]">GSTIN:</strong> 07AABCH1234F1Z8 •{" "}
                  <strong className="text-[#172016]">State Code:</strong> 07 (Delhi NCR)
                </p>
                <p>
                  <strong className="text-[#172016]">SAC Code:</strong> 996601 (Rental services of passenger vehicles)
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1 bg-[#F8FAF7] sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#E8EFE5]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#50644E] bg-[#EAF0E7] px-2.5 py-0.5 rounded-full inline-block">
                Tax Invoice
              </span>
              <p className="font-mono font-bold text-sm text-[#172016]">{data.invoiceNumber}</p>
              <p className="text-xs text-[#5C6B5A]">Date: {data.invoiceDate}</p>
              <p className="text-xs text-[#5C6B5A]">Booking Ref: <strong className="font-mono text-[#172016]">{data.bookingRef}</strong></p>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{data.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Customer & Trip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#829280] tracking-wider block mb-1">
                Billed To Customer
              </span>
              <p className="font-bold text-sm text-[#172016]">{data.customerName}</p>
              <p className="text-[#5C6B5A]">{data.customerPhone}</p>
              <p className="text-[#5C6B5A]">{data.customerEmail}</p>
              <p className="text-[#829280] mt-1">Place of Supply: Delhi NCR (07)</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#829280] tracking-wider block mb-1">
                Rental Trip Particulars
              </span>
              <p className="font-bold text-[#172016]">{data.vehicleName}</p>
              <p className="font-mono text-[#5C6B5A]">Reg: {data.vehicleRegistration}</p>
              <p className="text-[#5C6B5A]">Operating Hub: {data.hubLocation}</p>
              <p className="text-[#5C6B5A]">
                Period: {data.pickupDate} to {data.returnDate} ({data.rentalDays} Days)
              </p>
            </div>
          </div>

          {/* Line Item Charges Table */}
          <div className="border border-[#E8EFE5] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6F1] text-[#172016] border-b border-[#E8EFE5] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Description / SAC</th>
                  <th className="py-2.5 px-3 text-center">Days</th>
                  <th className="py-2.5 px-3 text-right">Daily Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4ED]">
                <tr>
                  <td className="py-3 px-4">
                    <strong className="text-[#172016] block">Vehicle Access Fee</strong>
                    <span className="text-[11px] text-[#5C6B5A]">
                      Tier: {data.conditionTier || "Executive Mint"} • Self-drive passenger vehicle (SAC 996601)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{data.rentalDays}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatINR(data.baseDailyRateINR)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#172016]">
                    {formatINR(data.baseRentalINR)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4">
                    <strong className="text-[#172016] block">Platform Facilitation &amp; Sanitization</strong>
                    <span className="text-[11px] text-[#5C6B5A]">
                      5% Platform charge, 360 walk-around certification
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">—</td>
                  <td className="py-2.5 px-3 text-right font-mono">—</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#172016]">
                    {formatINR(data.platformFeeINR)}
                  </td>
                </tr>

                {data.damageProtectionINR > 0 && (
                  <tr>
                    <td className="py-2.5 px-4">
                      <strong className="text-[#172016] block">Damage Protection Cover</strong>
                      <span className="text-[11px] text-[#5C6B5A]">
                        {data.protectionTierName || "Comprehensive Protection Plan"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{data.rentalDays}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatINR(Math.round(data.damageProtectionINR / data.rentalDays))}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#172016]">
                      {formatINR(data.damageProtectionINR)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="space-y-3 flex-1 text-xs text-[#5C6B5A]">
              <div className="p-3 bg-[#F8FAF7] rounded-xl border border-[#E8EFE5] space-y-1">
                <span className="font-bold text-[#172016] block">GST Statutory Note:</span>
                <p className="text-[11px] leading-relaxed">
                  Tax is collected under reverse charge provisions where applicable or paid directly under GSTIN 07AABCH1234F1Z8.
                </p>
              </div>

              {/* Deposit Settlement Reconciliation */}
              <div className="p-3 bg-[#F3F6F1] rounded-xl border border-[#D5E1D1] space-y-1.5">
                <span className="font-bold text-[#172016] block text-xs">
                  Deposit &amp; FASTag Settlement Reconciliation
                </span>
                <div className="flex justify-between text-[11px]">
                  <span>Initial Security Deposit Escrow:</span>
                  <span className="font-mono font-bold">{formatINR(data.depositHeldINR)}</span>
                </div>
                {data.fastagUsedINR !== undefined && (
                  <div className="flex justify-between text-[11px] text-red-700">
                    <span>FASTag Expressway Toll Deductions:</span>
                    <span className="font-mono font-bold">- {formatINR(data.fastagUsedINR)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold text-emerald-800 pt-1 border-t border-[#D5E1D1]">
                  <span>Refund Released to Customer Account:</span>
                  <span className="font-mono text-emerald-700">
                    {formatINR(data.depositRefundedINR ?? data.depositHeldINR)}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#5C6B5A]">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-bold text-[#172016]">
                  {formatINR(data.taxableSubtotalINR)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C6B5A]">
                <span>CGST (9%):</span>
                <span className="font-mono">{formatINR(data.cgstINR)}</span>
              </div>
              <div className="flex justify-between text-[#5C6B5A]">
                <span>SGST (9%):</span>
                <span className="font-mono">{formatINR(data.sgstINR)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#50644E] pt-1 border-t border-[#E8EFE5]">
                <span>Total GST (18%):</span>
                <span className="font-mono">{formatINR(data.totalTaxINR)}</span>
              </div>

              {data.fastagBufferINR > 0 && (
                <div className="flex justify-between text-[#5C6B5A]">
                  <span>FASTag Buffer Preload:</span>
                  <span className="font-mono">{formatINR(data.fastagBufferINR)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#5C6B5A]">
                <span>Refundable Deposit:</span>
                <span className="font-mono">{formatINR(data.depositHeldINR)}</span>
              </div>

              <div className="p-3 bg-[#172016] text-white rounded-xl flex justify-between items-center mt-3">
                <span className="font-bold text-xs">Total Amount Paid:</span>
                <strong className="font-mono text-base font-black text-emerald-400">
                  {formatINR(data.totalPaidINR)}
                </strong>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-6 border-t border-[#E8EFE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#829280]">
            <div>
              <p>This is a computer-generated tax invoice verified under digital signature.</p>
              <p>For questions or corporate billing: support@homiedrives.in</p>
            </div>
            <div className="sm:text-right">
              <span className="font-bold text-[#172016] block">Homie Drives Authorized Signatory</span>
              <span className="text-[10px]">Fleet Governance System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

