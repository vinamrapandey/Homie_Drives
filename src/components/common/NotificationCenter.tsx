"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNotification, NotificationChannel } from "@/types/notification";
import { INITIAL_NOTIFICATIONS } from "@/data/notifications";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  sendCustomerDispatchNotificationAction,
} from "@/actions/notifications";
import {
  Bell,
  CheckCheck,
  X,
  MessageCircle,
  Smartphone,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react";

interface NotificationCenterProps {
  className?: string;
  variant?: "navbar" | "admin" | "dark";
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = "",
  variant = "navbar",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeChannel, setActiveChannel] = useState<"all" | NotificationChannel>("all");
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchChannel, setDispatchChannel] = useState<NotificationChannel>("whatsapp");
  const [dispatchPhone, setDispatchPhone] = useState("+91 98112 34567");
  const [dispatchName, setDispatchName] = useState("Arjun Sharma");
  const [dispatchTemplate, setDispatchTemplate] = useState("kyc_verified");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, deliveryStatus: "read" } : n))
    );
    await markNotificationAsReadAction(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, deliveryStatus: "read" }))
    );
    await markAllNotificationsAsReadAction();
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setFeedback(null);

    let title = "Customer Update";
    let message = "Your Homie Drives booking has been updated.";
    let type: AppNotification["type"] = "booking_confirmed";

    if (dispatchTemplate === "kyc_verified") {
      title = "DigiLocker KYC Approved";
      message = "Your Aadhaar & Driving License verification is complete. Reservation is cleared for handover.";
      type = "kyc_verified";
    } else if (dispatchTemplate === "toll_debited") {
      title = "NETC FASTag Toll: ₹85 Debited";
      message = "Electronic barrier toll crossing at Kherki Daula (NH-48). FASTag buffer balance: ₹915.";
      type = "toll_debited";
    } else if (dispatchTemplate === "deposit_refunded") {
      title = "Security Deposit Refund Initiated";
      message = "Your net deposit of ₹14,550 has been released to your UPI account. Zero-Floor protection verified.";
      type = "deposit_refunded";
    } else if (dispatchTemplate === "contract_signed") {
      title = "Digital Contract Countersigned";
      message = "Your luxury rental agreement is tamper-sealed with SHA-256 signature hash.";
      type = "contract_signed";
    }

    try {
      const res = await sendCustomerDispatchNotificationAction({
        channel: dispatchChannel,
        type,
        title,
        message,
        recipient: dispatchPhone,
        recipientName: dispatchName,
        href: "/ride?tab=pass",
      });

      if (res.success && res.notification) {
        setNotifications((prev) => [res.notification!, ...prev]);
        setFeedback(res.message || "Message dispatched successfully.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch {
      setFeedback("Failed to send dispatch.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={`relative p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          variant === "admin"
            ? "bg-[#F8FAF7] hover:bg-[#EAF0E7] text-[#172016] border border-[#CFD8CD]"
            : variant === "dark"
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            : "bg-[#F3F6F1] hover:bg-[#EAF0E7] text-[#172016] border border-[#DFE6DC]"
        }`}
      >
        <Bell className="w-4 h-4 text-inherit" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Flyout */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#E1E8DF] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-[#172016] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Live Notifications &amp; Alerts
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-white/70 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Read All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Channel Filters */}
            <div className="px-3 py-2 bg-[#F8FAF7] border-b border-[#E8EFE5] flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveChannel("all")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeChannel === "all"
                    ? "bg-[#50644E] text-white shadow-2xs"
                    : "text-[#5C6B5A] hover:bg-white"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("whatsapp")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeChannel === "whatsapp"
                    ? "bg-[#075E54] text-white shadow-2xs"
                    : "text-[#5C6B5A] hover:bg-white"
                }`}
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("sms")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeChannel === "sms"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-[#5C6B5A] hover:bg-white"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("in_app")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeChannel === "in_app"
                    ? "bg-[#50644E] text-white shadow-2xs"
                    : "text-[#5C6B5A] hover:bg-white"
                }`}
              >
                <Bell className="w-3 h-3" />
                <span>In-App</span>
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F4ED]">
              {notifications
                .filter((n) => activeChannel === "all" || n.channel === activeChannel)
                .map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`p-3.5 hover:bg-[#F8FAF7] transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.read ? "bg-[#FAFBF9]" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.channel === "whatsapp" ? (
                        <div className="w-7 h-7 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#075E54]">
                          <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
                        </div>
                      ) : notif.channel === "sms" ? (
                        <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-[#EAF0E7] flex items-center justify-center text-[#50644E]">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#172016] truncate">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C6B5A] line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#829280]">
                        <span>{notif.recipientName} ({notif.recipient})</span>
                        <span className="font-mono">{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}

              {notifications.filter((n) => activeChannel === "all" || n.channel === activeChannel)
                .length === 0 && (
                <div className="p-8 text-center text-[#829280] text-xs">
                  No notifications in this channel.
                </div>
              )}
            </div>

            {/* Outbound Dispatch Simulator Section */}
            <div className="p-3 bg-[#F8FAF7] border-t border-[#E8EFE5]">
              {!isDispatchOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDispatchOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-[#F3F6F1] border border-[#CFD8CD] text-xs font-bold text-[#50644E] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Simulate Outbound SMS / WhatsApp Dispatch</span>
                </button>
              ) : (
                <form onSubmit={handleDispatch} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#172016] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Dispatch Transactional Message
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDispatchOpen(false)}
                      className="text-[10px] text-[#829280] hover:text-[#172016] cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-[#5C6B5A] block mb-0.5">
                        Channel
                      </label>
                      <select
                        value={dispatchChannel}
                        onChange={(e) => setDispatchChannel(e.target.value as NotificationChannel)}
                        className="w-full px-2 py-1 bg-white rounded-lg border border-[#CFD8CD] text-[11px] font-semibold text-[#172016] focus:outline-hidden"
                      >
                        <option value="whatsapp">WhatsApp Business</option>
                        <option value="sms">SMS Gateway</option>
                        <option value="in_app">In-App Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[#5C6B5A] block mb-0.5">
                        Template Event
                      </label>
                      <select
                        value={dispatchTemplate}
                        onChange={(e) => setDispatchTemplate(e.target.value)}
                        className="w-full px-2 py-1 bg-white rounded-lg border border-[#CFD8CD] text-[11px] font-semibold text-[#172016] focus:outline-hidden"
                      >
                        <option value="kyc_verified">DigiLocker KYC Approved</option>
                        <option value="toll_debited">FASTag Toll ₹85 Debited</option>
                        <option value="deposit_refunded">Deposit Refund Released</option>
                        <option value="contract_signed">Contract Countersigned</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={dispatchPhone}
                      onChange={(e) => setDispatchPhone(e.target.value)}
                      placeholder="+91 98112 34567"
                      className="flex-1 px-2 py-1 bg-white rounded-lg border border-[#CFD8CD] text-[11px] font-mono text-[#172016] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-3 py-1 rounded-lg bg-[#50644E] hover:bg-[#3D4D3B] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSending ? "Sending..." : "Dispatch"}
                    </button>
                  </div>

                  {feedback && (
                    <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded-md border border-emerald-200">
                      {feedback}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
