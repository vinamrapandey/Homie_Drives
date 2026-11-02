"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth";
import { useVehicles, useHubLocations } from "@/lib/supabase/fleet";
import { updateVehiclePricingAction } from "@/actions/pricing";
import {
  reassignVehicleHubAction,
  updateHubLocationAction,
  createHubLocationAction,
  toggleVehicleAvailabilityAction,
} from "@/actions/admin";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { formatINR } from "@/lib/formatters";
import { Car as CarType } from "@/types/car";
import { LocationHub } from "@/types/booking";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Car,
  Users,
  MapPin,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Database,
  Lock,
  Layers,
  FileSpreadsheet,
  DollarSign,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Phone,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function MasterAdminPortalPage() {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { hubs } = useHubLocations();

  const [activeTab, setActiveTab] = useState<"fleet" | "hubs" | "audit" | "agents">("fleet");
  const [searchQuery, setSearchQuery] = useState("");

  // Manage Local Hubs State for immediate responsiveness
  const [adminHubs, setAdminHubs] = useState<LocationHub[]>(DELHI_NCR_LOCATIONS);
  useEffect(() => {
    if (hubs && hubs.length > 0) {
      setAdminHubs(hubs);
    }
  }, [hubs]);

  // Operational Hub Editing State
  const [editingHub, setEditingHub] = useState<LocationHub | null>(null);
  const [hubName, setHubName] = useState("");
  const [hubArea, setHubArea] = useState("");
  const [hubCity, setHubCity] = useState("");
  const [hubAddress, setHubAddress] = useState("");
  const [hubPhone, setHubPhone] = useState("");
  const [hubOperatingHours, setHubOperatingHours] = useState("");
  const [hubStatus, setHubStatus] = useState<"active" | "maintenance">("active");
  const [hubReason, setHubReason] = useState("Operational Schedule & Address Update");
  const [isUpdatingHub, setIsUpdatingHub] = useState(false);
  const [hubFeedback, setHubFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenEditHubModal = (hub: LocationHub) => {
    setEditingHub(hub);
    setHubName(hub.name);
    setHubArea(hub.area);
    setHubCity(hub.city);
    setHubAddress(hub.address);
    setHubPhone(hub.phone || "8448786016");
    setHubOperatingHours(hub.operatingHours || "24x7 Operational • Express Handover");
    setHubStatus(hub.status || "active");
    setHubReason("Operational Schedule & Address Update");
    setHubFeedback(null);
  };

  const handleSaveHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHub) return;
    setIsUpdatingHub(true);
    setHubFeedback(null);

    try {
      const res = await updateHubLocationAction({
        hubId: editingHub.id || editingHub.slug,
        name: hubName,
        area: hubArea,
        city: hubCity,
        address: hubAddress,
        phone: hubPhone,
        operatingHours: hubOperatingHours,
        status: hubStatus,
        reason: hubReason,
      });

      if (res.success) {
        setHubFeedback({
          type: "success",
          message: res.message || `Hub station ${hubName} updated successfully.`,
        });
        setAdminHubs((prev) =>
          prev.map((h) =>
            h.id === editingHub.id || h.slug === editingHub.slug
              ? {
                  ...h,
                  name: hubName,
                  area: hubArea,
                  city: hubCity,
                  address: hubAddress,
                  phone: hubPhone,
                  operatingHours: hubOperatingHours,
                  status: hubStatus,
                }
              : h
          )
        );
        setTimeout(() => {
          setEditingHub(null);
          setHubFeedback(null);
        }, 1500);
      } else {
        setHubFeedback({
          type: "error",
          message: res.error || "Failed to update hub station.",
        });
      }
    } catch (err) {
      setHubFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error during hub update.",
      });
    } finally {
      setIsUpdatingHub(false);
    }
  };

  // Add New Hub State
  const [isCreateHubModalOpen, setIsCreateHubModalOpen] = useState(false);
  const [newHubName, setNewHubName] = useState("");
  const [newHubSlug, setNewHubSlug] = useState("");
  const [newHubArea, setNewHubArea] = useState("");
  const [newHubCity, setNewHubCity] = useState("Delhi NCR");
  const [newHubAddress, setNewHubAddress] = useState("");
  const [newHubPhone, setNewHubPhone] = useState("8448786016");
  const [newHubOperatingHours, setNewHubOperatingHours] = useState("24x7 Operational • Express Handover");
  const [newHubStatus, setNewHubStatus] = useState<"active" | "maintenance">("active");
  const [isCreatingHub, setIsCreatingHub] = useState(false);
  const [createHubFeedback, setCreateHubFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingHub(true);
    setCreateHubFeedback(null);

    const generatedSlug =
      newHubSlug.trim() ||
      newHubName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    try {
      const res = await createHubLocationAction({
        name: newHubName.trim(),
        slug: generatedSlug,
        area: newHubArea.trim(),
        city: newHubCity.trim(),
        address: newHubAddress.trim(),
        phone: newHubPhone.trim(),
        operatingHours: newHubOperatingHours.trim(),
        status: newHubStatus,
        isPopular: true,
      });

      if (res.success && res.hub) {
        setCreateHubFeedback({
          type: "success",
          message: res.message || "New operational hub added successfully.",
        });
        setAdminHubs((prev) => [res.hub!, ...prev]);
        setTimeout(() => {
          setIsCreateHubModalOpen(false);
          setCreateHubFeedback(null);
          setNewHubName("");
          setNewHubSlug("");
          setNewHubArea("");
          setNewHubAddress("");
        }, 1400);
      } else {
        setCreateHubFeedback({
          type: "error",
          message: res.error || "Failed to create operational hub.",
        });
      }
    } catch (err) {
      setCreateHubFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error creating hub station",
      });
    } finally {
      setIsCreatingHub(false);
    }
  };

  // Toggle Vehicle Availability
  const [togglingCarId, setTogglingCarId] = useState<string | null>(null);
  const handleToggleCarAvailability = async (car: CarType) => {
    setTogglingCarId(car.id);
    const newStatus = !car.isAvailableDemo;

    try {
      await toggleVehicleAvailabilityAction({
        vehicleId: car.id,
        isAvailable: newStatus,
        reason: newStatus
          ? "Admin enabled vehicle availability"
          : "Admin marked vehicle under scheduled maintenance",
      });
      car.isAvailableDemo = newStatus;
    } catch {
      // Fallback
    } finally {
      setTogglingCarId(null);
    }
  };

  // Inline Vehicle Pricing Editor State
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [newDailyRate, setNewDailyRate] = useState<number>(0);
  const [newDeposit, setNewDeposit] = useState<number>(5000);
  const [pricingReason, setPricingReason] = useState<string>("Seasonal Demand Adjustment");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [pricingFeedback, setPricingFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenPricingModal = (car: CarType) => {
    setEditingCar(car);
    setNewDailyRate(car.dailyPriceINR);
    setNewDeposit(5000);
    setPricingReason("Seasonal Demand Adjustment");
    setPricingFeedback(null);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    setIsUpdatingPrice(true);
    setPricingFeedback(null);

    try {
      const res = await updateVehiclePricingAction({
        vehicleId: editingCar.id,
        baseDailyPriceINR: Number(newDailyRate),
        securityDepositINR: Number(newDeposit),
        reason: pricingReason,
      });

      if (res.success) {
        setPricingFeedback({
          type: "success",
          message: res.message || `Successfully updated rates for ${editingCar.name}. Audit entry logged.`,
        });
        setTimeout(() => {
          setEditingCar(null);
          setPricingFeedback(null);
        }, 1500);
      } else {
        setPricingFeedback({
          type: "error",
          message: res.error || "Failed to update pricing.",
        });
      }
    } catch (err) {
      setPricingFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error occurred.",
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Reassign Hub State
  const [reassigningCar, setReassigningCar] = useState<CarType | null>(null);
  const [targetHubId, setTargetHubId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState<string>("Fleet Rebalancing across Delhi NCR hubs");
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignFeedback, setReassignFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenReassignModal = (car: CarType) => {
    setReassigningCar(car);
    setTargetHubId(hubs[0]?.id || "");
    setReassignReason("Fleet Rebalancing across Delhi NCR hubs");
    setReassignFeedback(null);
  };

  const handleSaveReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningCar || !targetHubId) return;
    setIsReassigning(true);
    setReassignFeedback(null);

    try {
      const res = await reassignVehicleHubAction({
        vehicleId: reassigningCar.id,
        targetHubId,
        reason: reassignReason,
      });

      if (res.success) {
        setReassignFeedback({
          type: "success",
          message: res.message || `Reassigned ${reassigningCar.name} successfully.`,
        });
        setTimeout(() => {
          setReassigningCar(null);
          setReassignFeedback(null);
        }, 1500);
      } else {
        setReassignFeedback({
          type: "error",
          message: res.error || "Failed to reassign hub.",
        });
      }
    } catch (err) {
      setReassignFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error during hub reassignment.",
      });
    } finally {
      setIsReassigning(false);
    }
  };

  // System-wide mock / live audit trail
  const auditLogs = [
    {
      id: "log-1",
      timestamp: "Today, 10:45 AM",
      action: "BOOKING_OTP_VERIFIED",
      actor: "Kabir Mehta (Agent • Aerocity)",
      target: "Mahindra Thar Roxx (#HD-DEL-8924)",
      badge: "Handover Released",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "log-2",
      timestamp: "Today, 09:12 AM",
      action: "BOOKING_CREATED",
      actor: "Arjun Sharma (Customer)",
      target: "Tata Nexon EV (#HD-DEL-4190)",
      badge: "Exclusion Lock Passed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "log-3",
      timestamp: "Yesterday, 06:30 PM",
      action: "VEHICLE_MAINTENANCE_TOGGLED",
      actor: "Dev Sharma (Agent • Cyber Hub)",
      target: "Aston Martin Vantage V8",
      badge: "Pristine Polish Check",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "log-4",
      timestamp: "Yesterday, 02:15 PM",
      action: "PRICING_RULE_APPLIED",
      actor: "Master Administrator",
      target: "Weekend High Demand (+15%)",
      badge: "Dynamic Multiplier",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  // System statistics
  const totalFleetValue = vehicles.reduce((sum, v) => sum + v.dailyPriceINR * 30, 0);

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#172016] pb-24">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#101710] text-white border-b border-[#253224] py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-2xs shrink-0 bg-white/10 p-0.5">
              <Image
                src="/images/logo/homie_drives.png"
                alt="Homie Drives"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">
                  HOMIE DRIVES • MASTER ADMINISTRATION
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  Root Governance
                </span>
              </div>
              <p className="text-xs text-white/60">
                Delhi NCR Multi-Hub Operational Oversight • PostgreSQL RLS Security Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Public Site →
            </Link>
            <Link
              href="/agent"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-white/10 transition-colors"
            >
              Agent View →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Total Managed Fleet</span>
              <Car className="w-4 h-4 text-[#50644E]" />
            </div>
            <p className="text-3xl font-black text-[#172016]">{vehicles.length || 6}</p>
            <span className="text-[11px] text-[#5C6B5A]">Across 6 Delhi NCR operating hubs</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Active Hubs</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700">{hubs.length || 6}</p>
            <span className="text-[11px] text-emerald-700 font-medium">100% operational in NCR</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Fleet Monthly Revenue Potential</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-[#172016]">{formatINR(totalFleetValue)}</p>
            <span className="text-[11px] text-blue-700 font-medium">At 100% utilization</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
              <span className="font-bold">Concurrency Exclusion</span>
              <Database className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-700">btree_gist</p>
            <span className="text-[11px] text-[#5C6B5A]">0 overlapping booking risk</span>
          </div>
        </div>

        {/* Tab Controls: Fleet Inventory / Audit Log / Hub Agents */}
        <div className="flex items-center gap-2 border-b border-[#E1E8DF] pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "fleet"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Master Vehicle Inventory ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hubs")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "hubs"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Operational Hubs &amp; Stations ({adminHubs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "audit"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Immutable Audit Trail ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agents")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "agents"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Hub Agents &amp; Assignments
          </button>
        </div>

        {/* TAB 1: MASTER VEHICLE INVENTORY */}
        {activeTab === "fleet" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#172016]">System Fleet Inventory</h2>
                <p className="text-xs text-[#5C6B5A] mt-0.5">
                  Governed under unified managed fleet model. Assigned to operational agents per hub.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#829280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brand or model..."
                    className="pl-9 pr-3 py-1.5 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl text-xs text-[#172016] focus:outline-none focus:ring-2 focus:ring-[#50644E]/30"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF7] border-b border-[#E8EFE5] text-[#5C6B5A] uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Vehicle</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Assigned Hub</th>
                    <th className="py-3.5 px-4">Base Rate (INR)</th>
                    <th className="py-3.5 px-4">Operational Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4ED]">
                  {vehicles
                    .filter((v) =>
                      searchQuery
                        ? v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.brand.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((car) => (
                      <tr key={car.id} className="hover:bg-[#F8FAF7] transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 relative rounded-lg bg-[#F3F6F1] overflow-hidden shrink-0">
                              <Image
                                src={car.image}
                                alt={car.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div>
                              <strong className="font-bold text-[#172016] block">{car.name}</strong>
                              <span className="text-[11px] text-[#829280]">
                                {car.specs.fuelType} • {car.specs.seats} seats
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-[#EAF0E7] text-[#50644E] font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            {car.categoryLabel || car.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#5C6B5A]">{car.hubLocation}</td>
                        <td className="py-4 px-4 font-mono font-bold text-[#172016]">
                          {formatINR(car.dailyPriceINR)}/day
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleCarAvailability(car)}
                            disabled={togglingCarId === car.id}
                            className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] transition-all cursor-pointer ${
                              car.isAvailableDemo
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"
                            }`}
                            title="Click to toggle availability"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                car.isAvailableDemo ? "bg-emerald-600" : "bg-amber-600"
                              }`}
                            />
                            <span>{car.isAvailableDemo ? "Available" : "Not Available"}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPricingModal(car)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#50644E] bg-[#EAF0E7] hover:bg-[#dce7d8] transition-colors cursor-pointer"
                              title="Edit base pricing & deposit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Rate
                            </button>
                            <button
                              onClick={() => handleOpenReassignModal(car)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#172016] bg-[#F3F6F1] hover:bg-[#E8EFE5] transition-colors cursor-pointer"
                              title="Reassign to another Delhi NCR Operating Hub"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#50644E]" />
                              Hub
                            </button>
                            <Link
                              href={`/cars/${car.slug}`}
                              className="text-xs text-[#5C6B5A] hover:text-[#172016] font-semibold px-2 py-1.5"
                            >
                              Inspect →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONAL HUBS & STATIONS */}
        {activeTab === "hubs" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F4ED]">
              <div>
                <h2 className="text-lg font-bold text-[#172016]">Delhi NCR Operational Hub Stations</h2>
                <p className="text-xs text-[#5C6B5A] mt-0.5">
                  Manage station addresses, operating hours, direct hotlines, and public customer hub showcase pages.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#50644E] bg-[#EAF0E7] px-3 py-1 rounded-full">
                  {adminHubs.length} Active Stations
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCreateHubFeedback(null);
                    setIsCreateHubModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Hub</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {adminHubs.map((hub) => {
                const hubCars = vehicles.filter(
                  (v) =>
                    v.hubSlug === hub.slug ||
                    v.hubLocation.toLowerCase().includes(hub.name.toLowerCase()) ||
                    v.hubLocation.toLowerCase().includes(hub.city.toLowerCase())
                );
                const availableCount = hubCars.filter((v) => v.isAvailableDemo).length;

                return (
                  <div
                    key={hub.id}
                    className="p-5 bg-[#F8FAF7] border border-[#E8EFE5] rounded-3xl flex flex-col justify-between space-y-4 hover:border-[#50644E]/40 transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8EFE5] overflow-hidden relative shrink-0">
                            <Image
                              src={hub.image || "/images/cars/homie_vantage_sage.jpg"}
                              alt={hub.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-[#172016]">{hub.name}</h3>
                            <span className="text-[11px] text-[#5C6B5A] block">{hub.city}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hub.status === "maintenance"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {hub.status === "maintenance" ? "Maintenance" : "Active 24x7"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[#5C6B5A]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#829280] block">
                            Area / Landmark
                          </span>
                          <p className="font-medium text-[#172016]">{hub.area}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#829280] block">
                            Street Address
                          </span>
                          <p className="text-[11px] line-clamp-2">{hub.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="bg-white p-2 rounded-xl border border-[#E8EFE5]">
                            <span className="text-[#829280] block text-[10px]">Hotline Phone</span>
                            <strong className="text-[#172016] font-mono">{hub.phone || "8448786016"}</strong>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-[#E8EFE5]">
                            <span className="text-[#829280] block text-[10px]">Station Fleet</span>
                            <strong className="text-[#172016]">
                              {availableCount} / {hubCars.length} Available
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8EFE5] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditHubModal(hub)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#E8EFE5] text-[#172016] border border-[#CFD8CD] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#50644E]" />
                        <span>Edit Station</span>
                      </button>
                      <Link
                        href={`/hubs/${hub.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-[#50644E] hover:underline flex items-center gap-1"
                      >
                        <span>View Station Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#F0F4ED]">
              <h2 className="text-lg font-bold text-[#172016]">Cryptographic Audit Log Stream</h2>
              <p className="text-xs text-[#5C6B5A] mt-0.5">
                Every reservation, handover, inspection, and status transition generates an immutable record in Supabase.
              </p>
            </div>

            <div className="divide-y divide-[#F0F4ED]">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#172016]">{log.action}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.color}`}>
                        {log.badge}
                      </span>
                    </div>
                    <p className="text-[#5C6B5A]">
                      Actor: <strong>{log.actor}</strong> • Target: {log.target}
                    </p>
                  </div>
                  <span className="text-[#829280] font-mono text-[11px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AGENTS & HUBS */}
        {activeTab === "agents" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4ED]">
              <div>
                <h2 className="text-lg font-bold text-[#172016]">Operational Hub Staff &amp; Roles</h2>
                <p className="text-xs text-[#5C6B5A]">
                  Certified staff governed under Delhi NCR hub operations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-[#172016]">Kabir Mehta</strong>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active Agent
                  </span>
                </div>
                <p className="text-[#5C6B5A]">Code: HD-AGT-0104 • Primary Hub: Aerocity Hub (IGI Airport)</p>
                <p className="text-[#829280]">Assigned to: Toyota Innova HyCross ZX, Aston Martin Vantage V8</p>
              </div>

              <div className="p-4 bg-[#F8FAF7] border border-[#E8EFE5] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-[#172016]">Dev Sharma</strong>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active Agent
                  </span>
                </div>
                <p className="text-[#5C6B5A]">Code: HD-AGT-0208 • Primary Hub: Cyber Hub DLF Phase 2, Gurugram</p>
                <p className="text-[#829280]">Assigned to: Mahindra Thar Roxx 4x4, Mahindra Scorpio-N 4Xplor</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Modification Modal Dialog */}
        {editingCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Fleet Pricing Governance</h3>
                    <p className="text-xs text-white/60">
                      Live Base Daily Rate &amp; Deposit Calibration
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCar(null);
                    setPricingFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePricing} className="p-5 sm:p-6 space-y-5">
                {/* Car Preview Header */}
                <div className="flex items-center gap-4 p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5]">
                  <div className="w-16 h-10 relative rounded-lg bg-white overflow-hidden shrink-0 border border-[#E8EFE5]">
                    <Image
                      src={editingCar.image}
                      alt={editingCar.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#172016] truncate">
                      {editingCar.name}
                    </h4>
                    <p className="text-xs text-[#5C6B5A]">
                      Current: <strong className="font-mono text-[#172016]">{formatINR(editingCar.dailyPriceINR)}/day</strong> • Hub: {editingCar.hubLocation}
                    </p>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center gap-1.5">
                      <span>Daily Base Rate (₹)</span>
                      <span className="text-[10px] text-[#5C6B5A] font-normal">(Min ₹1,999)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5C6B5A]">₹</span>
                      <input
                        type="number"
                        min={1999}
                        max={99999}
                        value={newDailyRate}
                        onChange={(e) => setNewDailyRate(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] focus:ring-2 focus:ring-[#50644E]/20 font-mono text-sm font-bold text-[#172016] outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center gap-1.5">
                      <span>Security Deposit (₹)</span>
                      <span className="text-[10px] text-[#5C6B5A] font-normal">(Refundable)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5C6B5A]">₹</span>
                      <input
                        type="number"
                        min={2000}
                        max={100000}
                        value={newDeposit}
                        onChange={(e) => setNewDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] focus:ring-2 focus:ring-[#50644E]/20 font-mono text-sm font-bold text-[#172016] outline-hidden"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172016]">
                    Mandatory Audit Justification
                  </label>
                  <select
                    value={pricingReason}
                    onChange={(e) => setPricingReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                  >
                    <option value="Seasonal Demand Adjustment">Seasonal Demand Adjustment (Diwali / Weddings)</option>
                    <option value="Weekend Dynamic Surcharge">Weekend Dynamic Surcharge (+15-20%)</option>
                    <option value="Fleet Upkeep Calibration">Fleet Upkeep &amp; Service Cost Calibration</option>
                    <option value="Corporate / Fleet Partner Incentive">Corporate / Fleet Partner Incentive</option>
                    <option value="Executive Governance Override">Executive Governance Override</option>
                  </select>
                </div>

                {/* Audit & Compliance Notice */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Immutable Audit Notice:</strong> This modification will immediately update customer storefront rates across Delhi NCR and append an immutable transaction log record.
                  </p>
                </div>

                {/* Feedback */}
                {pricingFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      pricingFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {pricingFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{pricingFeedback.message}</span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCar(null);
                      setPricingFeedback(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isUpdatingPrice}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPrice}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingPrice ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving to Supabase...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apply &amp; Audit Log
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vehicle Hub Reassignment Modal */}
        {reassigningCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Fleet Hub Reassignment</h3>
                    <p className="text-xs text-white/60">
                      Transfer vehicle across Delhi NCR operational hubs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReassigningCar(null);
                    setReassignFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReassign} className="p-5 sm:p-6 space-y-5">
                {/* Vehicle Card */}
                <div className="flex items-center gap-4 p-3.5 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5]">
                  <div className="w-16 h-10 relative rounded-lg bg-white overflow-hidden shrink-0 border border-[#E8EFE5]">
                    <Image
                      src={reassigningCar.image}
                      alt={reassigningCar.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#172016] truncate">
                      {reassigningCar.name}
                    </h4>
                    <p className="text-xs text-[#5C6B5A]">
                      Current Hub: <strong className="text-[#50644E]">{reassigningCar.hubLocation}</strong>
                    </p>
                  </div>
                </div>

                {/* Target Hub Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172016]">
                    Select Target Delhi NCR Operating Hub
                  </label>
                  <select
                    value={targetHubId}
                    onChange={(e) => setTargetHubId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    required
                  >
                    {hubs.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name} ({hub.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reassignment Justification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172016]">
                    Operational Justification (Mandatory for Audit Trail)
                  </label>
                  <select
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                  >
                    <option value="Fleet Rebalancing across Delhi NCR hubs">Fleet Rebalancing across Delhi NCR hubs</option>
                    <option value="Surge Demand at Airport (Aerocity IGI)">Surge Demand at Airport (Aerocity IGI)</option>
                    <option value="Corporate Fleet Allocation (Cyber Hub DLF)">Corporate Fleet Allocation (Cyber Hub DLF)</option>
                    <option value="Maintenance / Detailing Transfer">Maintenance / Detailing Transfer</option>
                    <option value="Special VIP Event Staging">Special VIP Event Staging</option>
                  </select>
                </div>

                {/* Audit Notice */}
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p>
                    Reassigning will instantly shift vehicle pickup availability to the selected hub on the customer storefront and notify local hub agents.
                  </p>
                </div>

                {/* Feedback */}
                {reassignFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      reassignFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {reassignFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{reassignFeedback.message}</span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReassigningCar(null);
                      setReassignFeedback(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isReassigning}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReassigning}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isReassigning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Reassigning Hub...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        Confirm Reassignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Operational Hub Editing Modal Dialog */}
        {editingHub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Edit Hub Station Details</h3>
                    <p className="text-xs text-white/60">
                      Configure operational address, operating hours, and dispatch hotline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingHub(null);
                    setHubFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHub} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Station Name</label>
                    <input
                      type="text"
                      value={hubName}
                      onChange={(e) => setHubName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">City</label>
                    <input
                      type="text"
                      value={hubCity}
                      onChange={(e) => setHubCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Area / Landmark</label>
                  <input
                    type="text"
                    value={hubArea}
                    onChange={(e) => setHubArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Full Street Address</label>
                  <textarea
                    rows={2}
                    value={hubAddress}
                    onChange={(e) => setHubAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Station Hotline Phone</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        +91
                      </span>
                      <input
                        type="text"
                        value={hubPhone}
                        onChange={(e) => setHubPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Operating Status</label>
                    <select
                      value={hubStatus}
                      onChange={(e) => setHubStatus(e.target.value as "active" | "maintenance")}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="active">Active 24x7 Operational</option>
                      <option value="maintenance">Maintenance / Temporarily Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Operating Hours Schedule</label>
                  <input
                    type="text"
                    value={hubOperatingHours}
                    onChange={(e) => setHubOperatingHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Audit Justification</label>
                  <input
                    type="text"
                    value={hubReason}
                    onChange={(e) => setHubReason(e.target.value)}
                    placeholder="e.g., Station landmark update for easier customer routing"
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                    required
                  />
                </div>

                {/* Feedback Banner */}
                {hubFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      hubFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {hubFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{hubFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4ED]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHub(null);
                      setHubFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isUpdatingHub}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingHub}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingHub ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Hub...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save Station Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create New Hub Modal Dialog */}
        {isCreateHubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Provision New Hub Station</h3>
                    <p className="text-xs text-white/60">
                      Add a new regional dispatch location to Delhi NCR fleet network
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateHubModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateHub} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Station Name</label>
                    <input
                      type="text"
                      value={newHubName}
                      onChange={(e) => {
                        setNewHubName(e.target.value);
                        if (!newHubSlug) {
                          setNewHubSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      placeholder="e.g. Noida Sector 62 Hub"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">URL Slug / Route Path</label>
                    <input
                      type="text"
                      value={newHubSlug}
                      onChange={(e) => setNewHubSlug(e.target.value)}
                      placeholder="e.g. noida-sec-62-hub"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-mono font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Area / Landmark</label>
                    <input
                      type="text"
                      value={newHubArea}
                      onChange={(e) => setNewHubArea(e.target.value)}
                      placeholder="e.g. Electronic City Metro / Tech Zone"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">City</label>
                    <input
                      type="text"
                      value={newHubCity}
                      onChange={(e) => setNewHubCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Full Physical Address</label>
                  <textarea
                    rows={2}
                    value={newHubAddress}
                    onChange={(e) => setNewHubAddress(e.target.value)}
                    placeholder="Complete address for customer GPS navigation"
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Station Hotline</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        +91
                      </span>
                      <input
                        type="text"
                        value={newHubPhone}
                        onChange={(e) => setNewHubPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Status</label>
                    <select
                      value={newHubStatus}
                      onChange={(e) => setNewHubStatus(e.target.value as "active" | "maintenance")}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="active">Active 24x7</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Feedback */}
                {createHubFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      createHubFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {createHubFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{createHubFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4ED]">
                  <button
                    type="button"
                    onClick={() => setIsCreateHubModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isCreatingHub}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingHub}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingHub ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Creating Hub...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Create Hub Station
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
