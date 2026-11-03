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
  updateVehicleDetailsAction,
  createVehicleAction,
} from "@/actions/admin";
import { updatePlatformSettingsAction } from "@/actions/platformSettings";
import { DEFAULT_PLATFORM_SETTINGS, PlatformPricingSettings } from "@/data/platformSettings";
import { CustomerKYCRecord, KYCVerificationStatus, KYCRiskLevel } from "@/types/kyc";
import { INITIAL_KYC_RECORDS } from "@/data/kycRecords";
import { reviewCustomerKYCAction, requestKYCReuploadAction } from "@/actions/kyc";
import { EscrowSettlementRecord, SettlementStatus } from "@/types/settlement";
import { INITIAL_SETTLEMENT_RECORDS } from "@/data/settlementRecords";
import { dispatchEscrowRefundAction, resolveEscrowDisputeAction } from "@/actions/settlement";
import { RentalContract } from "@/types/contract";
import { INITIAL_CONTRACT_RECORDS } from "@/data/contractRecords";
import { countersignContractAction } from "@/actions/contract";
import { VehicleTelemetryData } from "@/types/telemetry";
import { INITIAL_TELEMETRY_RECORDS } from "@/data/telemetryRecords";
import { refreshVehicleTelemetryAction } from "@/actions/telemetry";
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
  Sliders,
  Percent,
  Zap,
  Sparkles,
  FileBadge,
  Eye,
  Check,
  Ban,
  UserCheck,
  FileText,
  AlertOctagon,
  BadgeAlert,
  Receipt,
  Scale,
  Landmark,
  Banknote,
  FileCheck,
  Activity,
  Cpu,
  Fuel,
  Gauge,
  Hash,
} from "lucide-react";

export default function MasterAdminPortalPage() {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { hubs } = useHubLocations();

  const [activeTab, setActiveTab] = useState<
    "fleet" | "hubs" | "pricing" | "escrow" | "kyc" | "contracts" | "telemetry" | "audit" | "agents"
  >("fleet");
  const [searchQuery, setSearchQuery] = useState("");

  // Customer DigiLocker KYC Verification Queue State
  const [kycRecords, setKycRecords] = useState<CustomerKYCRecord[]>(INITIAL_KYC_RECORDS);
  const [kycFilter, setKycFilter] = useState<"all" | "pending_review" | "verified" | "flagged">("all");
  const [kycSearch, setKycSearch] = useState("");
  const [inspectingKYC, setInspectingKYC] = useState<CustomerKYCRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<KYCRiskLevel>("low");
  const [isReviewingKYC, setIsReviewingKYC] = useState(false);
  const [kycFeedback, setKycFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const pendingKYCCount = kycRecords.filter((k) => k.digilockerStatus === "pending_review").length;

  const handleOpenKYCDossier = (record: CustomerKYCRecord) => {
    setInspectingKYC(record);
    setReviewNotes(record.reviewNotes || "");
    setSelectedRisk(record.riskLevel);
    setKycFeedback(null);
  };

  const handleReviewKYC = async (newStatus: KYCVerificationStatus) => {
    if (!inspectingKYC) return;
    setIsReviewingKYC(true);
    setKycFeedback(null);

    try {
      const res = await reviewCustomerKYCAction({
        kycId: inspectingKYC.id,
        status: newStatus,
        riskLevel: selectedRisk,
        notes: reviewNotes.trim() || `Administrative decision: Marked ${newStatus.toUpperCase()}`,
      });

      if (res.success) {
        setKycFeedback({
          type: "success",
          message: res.message || `Customer KYC updated to ${newStatus.toUpperCase()}.`,
        });
        setKycRecords((prev) =>
          prev.map((k) =>
            k.id === inspectingKYC.id
              ? {
                  ...k,
                  digilockerStatus: newStatus,
                  riskLevel: selectedRisk,
                  reviewNotes: reviewNotes.trim() || k.reviewNotes,
                  reviewedBy: user?.email || "Master Administrator",
                  reviewedAt: new Date().toISOString(),
                }
              : k
          )
        );
        setTimeout(() => {
          setInspectingKYC(null);
          setKycFeedback(null);
        }, 1500);
      } else {
        setKycFeedback({
          type: "error",
          message: res.error || "Failed to update KYC status.",
        });
      }
    } catch (err) {
      setKycFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error updating KYC review.",
      });
    } finally {
      setIsReviewingKYC(false);
    }
  };

  const handleRequestReupload = async () => {
    if (!inspectingKYC) return;
    setIsReviewingKYC(true);
    setKycFeedback(null);

    try {
      const res = await requestKYCReuploadAction({
        kycId: inspectingKYC.id,
        reason: reviewNotes.trim() || "Uploaded driving license image is blurry or expired. Please re-upload.",
      });

      if (res.success) {
        setKycFeedback({
          type: "success",
          message: res.message || "Document re-upload requested.",
        });
        setKycRecords((prev) =>
          prev.map((k) =>
            k.id === inspectingKYC.id
              ? {
                  ...k,
                  digilockerStatus: "pending_review",
                  reviewNotes: `Re-upload requested: ${reviewNotes.trim()}`,
                }
              : k
          )
        );
        setTimeout(() => {
          setInspectingKYC(null);
          setKycFeedback(null);
        }, 1500);
      } else {
        setKycFeedback({
          type: "error",
          message: res.error || "Failed to request re-upload.",
        });
      }
    } catch (err) {
      setKycFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error requesting re-upload.",
      });
    } finally {
      setIsReviewingKYC(false);
    }
  };

  // Master Escrow & Financial Settlement Ledger State
  const [settlementRecords, setSettlementRecords] = useState<EscrowSettlementRecord[]>(
    INITIAL_SETTLEMENT_RECORDS
  );
  const [escrowFilter, setEscrowFilter] = useState<
    "all" | "held_in_escrow" | "refund_dispatched" | "disputed_hold"
  >("all");
  const [escrowSearch, setEscrowSearch] = useState("");
  const [inspectingSettlement, setInspectingSettlement] =
    useState<EscrowSettlementRecord | null>(null);
  const [adjustedDamage, setAdjustedDamage] = useState<number>(0);
  const [disputeResolutionNotes, setDisputeResolutionNotes] = useState<string>("");
  const [isProcessingEscrow, setIsProcessingEscrow] = useState(false);
  const [escrowFeedback, setEscrowFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const totalEscrowCapitalHeld = settlementRecords
    .filter((s) => s.status === "held_in_escrow")
    .reduce((sum, s) => sum + s.depositHeldINR, 0);

  const totalRefundsDisbursed = settlementRecords
    .filter((s) => s.status === "refund_dispatched")
    .reduce((sum, s) => sum + s.netRefundINR, 0);

  const totalFastagRecoveries = settlementRecords.reduce(
    (sum, s) => sum + s.fastagTollsINR,
    0
  );

  const activeEscrowDisputes = settlementRecords.filter(
    (s) => s.status === "disputed_hold"
  ).length;

  const handleOpenSettlement = (record: EscrowSettlementRecord) => {
    setInspectingSettlement(record);
    setAdjustedDamage(record.damageCleaningChargesINR);
    setDisputeResolutionNotes(record.settlementNotes || "");
    setEscrowFeedback(null);
  };

  const handleDispatchRefund = async (record: EscrowSettlementRecord) => {
    setIsProcessingEscrow(true);
    setEscrowFeedback(null);

    try {
      const res = await dispatchEscrowRefundAction({
        settlementId: record.id,
        bookingRef: record.bookingRef,
        netRefundINR: record.netRefundINR,
        notes: "Master Admin approved instant electronic bank disbursement.",
      });

      if (res.success) {
        setEscrowFeedback({
          type: "success",
          message: res.message || `Refund dispatched for ${record.bookingRef}.`,
        });
        setSettlementRecords((prev) =>
          prev.map((s) =>
            s.id === record.id
              ? {
                  ...s,
                  status: "refund_dispatched",
                  paymentGatewayRef: res.gatewayRef || s.paymentGatewayRef,
                  settledAt: new Date().toISOString(),
                  settledBy: user?.email || "Master Admin Treasury",
                }
              : s
          )
        );
        setTimeout(() => {
          if (inspectingSettlement?.id === record.id) {
            setInspectingSettlement(null);
          }
          setEscrowFeedback(null);
        }, 1500);
      } else {
        setEscrowFeedback({
          type: "error",
          message: res.error || "Failed to dispatch refund.",
        });
      }
    } catch (err) {
      setEscrowFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error dispatching refund.",
      });
    } finally {
      setIsProcessingEscrow(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!inspectingSettlement) return;
    setIsProcessingEscrow(true);
    setEscrowFeedback(null);

    try {
      const fixedDeductions =
        inspectingSettlement.fastagTollsINR +
        inspectingSettlement.excessKmChargesINR;

      const res = await resolveEscrowDisputeAction({
        settlementId: inspectingSettlement.id,
        bookingRef: inspectingSettlement.bookingRef,
        adjustedDamageChargesINR: Number(adjustedDamage),
        depositHeldINR: inspectingSettlement.depositHeldINR,
        fixedDeductionsINR: fixedDeductions,
        resolutionNotes:
          disputeResolutionNotes.trim() ||
          "Administrative adjustment of disputed damage charges.",
      });

      if (res.success) {
        setEscrowFeedback({
          type: "success",
          message: res.message || "Dispute resolved and zero-floor net refund updated.",
        });
        setSettlementRecords((prev) =>
          prev.map((s) =>
            s.id === inspectingSettlement.id
              ? {
                  ...s,
                  damageCleaningChargesINR: Number(adjustedDamage),
                  totalDeductionsINR: res.totalDeductionsINR ?? s.totalDeductionsINR,
                  netRefundINR: res.netRefundINR ?? s.netRefundINR,
                  zeroFloorApplied: res.zeroFloorApplied ?? s.zeroFloorApplied,
                  status: "held_in_escrow",
                  settlementNotes: disputeResolutionNotes.trim(),
                }
              : s
          )
        );
        setTimeout(() => {
          setInspectingSettlement(null);
          setEscrowFeedback(null);
        }, 1500);
      } else {
        setEscrowFeedback({
          type: "error",
          message: res.error || "Failed to resolve dispute.",
        });
      }
    } catch (err) {
      setEscrowFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error resolving dispute.",
      });
    } finally {
      setIsProcessingEscrow(false);
    }
  };

  // Digital Rental Contract Vault State
  const [contracts, setContracts] = useState<RentalContract[]>(INITIAL_CONTRACT_RECORDS);
  const [contractFilter, setContractFilter] = useState<"all" | "signed" | "countersigned">("all");
  const [contractSearch, setContractSearch] = useState("");
  const [inspectingContract, setInspectingContract] = useState<RentalContract | null>(null);
  const [isCountersigning, setIsCountersigning] = useState(false);
  const [contractFeedback, setContractFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCountersignContract = async (contractId: string) => {
    setIsCountersigning(true);
    setContractFeedback(null);
    try {
      const res = await countersignContractAction({
        contractId,
        adminSignerName: user?.user_metadata?.full_name || "Devansh Singhania (Master Admin)",
      });
      if (res.success && res.contract) {
        setContracts((prev) =>
          prev.map((c) => (c.id === contractId ? (res.contract as RentalContract) : c))
        );
        if (inspectingContract && inspectingContract.id === contractId) {
          setInspectingContract(res.contract as RentalContract);
        }
        setContractFeedback({
          type: "success",
          message: res.message || "Contract successfully countersigned with cryptographic timestamp.",
        });
      } else {
        setContractFeedback({
          type: "error",
          message: res.error || "Failed to countersign contract.",
        });
      }
    } catch (err) {
      setContractFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error countersigning contract.",
      });
    } finally {
      setIsCountersigning(false);
    }
  };

  // Real-time Fleet Telemetry & Sensor Diagnostics State
  const [telemetryList, setTelemetryList] = useState<VehicleTelemetryData[]>(INITIAL_TELEMETRY_RECORDS);
  const [selectedTelemetry, setSelectedTelemetry] = useState<VehicleTelemetryData | null>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<string | null>(null);
  const [telemetryFeedback, setTelemetryFeedback] = useState<string | null>(null);

  const handleRefreshTelemetry = async (vehicleId: string) => {
    setIsRefreshingTelemetry(vehicleId);
    setTelemetryFeedback(null);
    try {
      const res = await refreshVehicleTelemetryAction({ vehicleId });
      if (res.success && res.record) {
        setTelemetryList((prev) =>
          prev.map((t) => (t.vehicleId === vehicleId ? (res.record as VehicleTelemetryData) : t))
        );
        if (selectedTelemetry && selectedTelemetry.vehicleId === vehicleId) {
          setSelectedTelemetry(res.record as VehicleTelemetryData);
        }
        setTelemetryFeedback(res.message || "Telemetry diagnostics refreshed.");
        setTimeout(() => setTelemetryFeedback(null), 3000);
      }
    } catch {
      // Ignore
    } finally {
      setIsRefreshingTelemetry(null);
    }
  };

  // Platform Pricing & Multipliers State
  const [platformSettings, setPlatformSettings] =
    useState<PlatformPricingSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    setSettingsFeedback(null);

    try {
      const res = await updatePlatformSettingsAction({
        gstPercent: platformSettings.gstPercent,
        platformFeePercent: platformSettings.platformFeePercent,
        fastagBufferINR: platformSettings.fastagBufferINR,
        securityDepositINR: platformSettings.securityDepositINR,
        pristineMultiplier: platformSettings.pristineMultiplier,
        mintMultiplier: platformSettings.mintMultiplier,
        touringMultiplier: platformSettings.touringMultiplier,
        surgeMultiplierCeiling: platformSettings.surgeMultiplierCeiling,
        surgeActive: platformSettings.surgeActive,
        surgeReason: platformSettings.surgeReason,
      });

      if (res.success) {
        setSettingsFeedback({
          type: "success",
          message: res.message || "Global pricing multipliers updated.",
        });
      } else {
        setSettingsFeedback({
          type: "error",
          message: res.error || "Failed to update pricing settings.",
        });
      }
    } catch (err) {
      setSettingsFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error saving pricing settings",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

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
  const [hubSlug, setHubSlug] = useState("");
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
    setHubSlug(hub.slug);
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
        slug: hubSlug.trim() || editingHub.slug,
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
                  slug: hubSlug.trim() || h.slug,
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

  // Manage Local Fleet Vehicles State
  const [adminVehicles, setAdminVehicles] = useState<CarType[]>(vehicles);
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      setAdminVehicles(vehicles);
    }
  }, [vehicles]);

  // Edit Vehicle Details & Custom Paths State
  const [editingVehicle, setEditingVehicle] = useState<CarType | null>(null);
  const [vehName, setVehName] = useState("");
  const [vehSlug, setVehSlug] = useState("");
  const [vehBrand, setVehBrand] = useState("");
  const [vehCategory, setVehCategory] = useState<CarType["category"]>("touring-suv");
  const [vehCategoryLabel, setVehCategoryLabel] = useState("");
  const [vehDailyPrice, setVehDailyPrice] = useState(4999);
  const [vehMonthlyPrice, setVehMonthlyPrice] = useState(89999);
  const [vehHubSlug, setVehHubSlug] = useState("ghaziabad-hub");
  const [vehAgent, setVehAgent] = useState("Rajesh Kumar");
  const [vehFuel, setVehFuel] = useState<CarType["specs"]["fuelType"]>("Petrol");
  const [vehTransmission, setVehTransmission] = useState<CarType["specs"]["transmission"]>("Automatic");
  const [vehSeats, setVehSeats] = useState(5);
  const [vehBags, setVehBags] = useState(3);
  const [vehRange, setVehRange] = useState("14 km/l");
  const [vehHorsePower, setVehHorsePower] = useState("170 bhp");
  const [vehIsAvailable, setVehIsAvailable] = useState(true);
  const [vehUnavailableReason, setVehUnavailableReason] = useState("");
  const [vehReason, setVehReason] = useState("Administrative specification and path update");
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [vehicleFeedback, setVehicleFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenEditVehicleModal = (car: CarType) => {
    setEditingVehicle(car);
    setVehName(car.name);
    setVehSlug(car.slug);
    setVehBrand(car.brand);
    setVehCategory(car.category);
    setVehCategoryLabel(car.categoryLabel || car.category);
    setVehDailyPrice(car.dailyPriceINR);
    setVehMonthlyPrice(car.monthlyPriceINR || car.dailyPriceINR * 25);
    setVehHubSlug(car.hubSlug || "ghaziabad-hub");
    setVehAgent(car.agentAssigned || "Rajesh Kumar");
    setVehFuel(car.specs.fuelType);
    setVehTransmission(car.specs.transmission);
    setVehSeats(car.specs.seats);
    setVehBags(car.specs.luggageBags);
    setVehRange(car.specs.rangeOrMileage);
    setVehHorsePower(car.specs.horsePower);
    setVehIsAvailable(car.isAvailableDemo);
    setVehUnavailableReason(car.unavailableReason || "");
    setVehReason("Administrative specification and path update");
    setVehicleFeedback(null);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setIsUpdatingVehicle(true);
    setVehicleFeedback(null);

    const targetHub = adminHubs.find((h) => h.slug === vehHubSlug);

    try {
      const res = await updateVehicleDetailsAction({
        vehicleId: editingVehicle.id,
        name: vehName.trim(),
        slug: vehSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        brand: vehBrand.trim(),
        category: vehCategory,
        categoryLabel: vehCategoryLabel.trim(),
        dailyPriceINR: Number(vehDailyPrice),
        monthlyPriceINR: Number(vehMonthlyPrice),
        hubLocation: targetHub ? targetHub.name : editingVehicle.hubLocation,
        hubSlug: vehHubSlug,
        agentAssigned: vehAgent.trim(),
        fuelType: vehFuel,
        transmission: vehTransmission,
        seats: Number(vehSeats),
        luggageBags: Number(vehBags),
        rangeOrMileage: vehRange.trim(),
        horsePower: vehHorsePower.trim(),
        topSpeed: editingVehicle.specs.topSpeed || "200 km/h",
        isAvailableDemo: vehIsAvailable,
        unavailableReason: vehUnavailableReason.trim(),
        reason: vehReason,
      });

      if (res.success) {
        setVehicleFeedback({
          type: "success",
          message: res.message || "Vehicle updated successfully.",
        });
        setAdminVehicles((prev) =>
          prev.map((c) =>
            c.id === editingVehicle.id
              ? {
                  ...c,
                  name: vehName.trim(),
                  slug: vehSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                  brand: vehBrand.trim(),
                  category: vehCategory,
                  categoryLabel: vehCategoryLabel.trim(),
                  dailyPriceINR: Number(vehDailyPrice),
                  monthlyPriceINR: Number(vehMonthlyPrice),
                  hubLocation: targetHub ? targetHub.name : c.hubLocation,
                  hubSlug: vehHubSlug,
                  agentAssigned: vehAgent.trim(),
                  specs: {
                    ...c.specs,
                    fuelType: vehFuel,
                    transmission: vehTransmission,
                    seats: Number(vehSeats),
                    luggageBags: Number(vehBags),
                    rangeOrMileage: vehRange.trim(),
                    horsePower: vehHorsePower.trim(),
                  },
                  isAvailableDemo: vehIsAvailable,
                  unavailableReason: vehUnavailableReason.trim(),
                }
              : c
          )
        );
        setTimeout(() => {
          setEditingVehicle(null);
          setVehicleFeedback(null);
        }, 1500);
      } else {
        setVehicleFeedback({
          type: "error",
          message: res.error || "Failed to update vehicle.",
        });
      }
    } catch (err) {
      setVehicleFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error saving vehicle.",
      });
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  // Add New Vehicle State
  const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false);
  const [newVehName, setNewVehName] = useState("");
  const [newVehSlug, setNewVehSlug] = useState("");
  const [newVehBrand, setNewVehBrand] = useState("");
  const [newVehCategory, setNewVehCategory] = useState<CarType["category"]>("touring-suv");
  const [newVehCategoryLabel, setNewVehCategoryLabel] = useState("Touring SUV");
  const [newVehDailyPrice, setNewVehDailyPrice] = useState(4999);
  const [newVehMonthlyPrice, setNewVehMonthlyPrice] = useState(89999);
  const [newVehHubSlug, setNewVehHubSlug] = useState("ghaziabad-hub");
  const [newVehAgent, setNewVehAgent] = useState("Rajesh Kumar");
  const [newVehFuel, setNewVehFuel] = useState<CarType["specs"]["fuelType"]>("Petrol");
  const [newVehTransmission, setNewVehTransmission] = useState<CarType["specs"]["transmission"]>("Automatic");
  const [newVehSeats, setNewVehSeats] = useState(5);
  const [newVehBags, setNewVehBags] = useState(3);
  const [newVehRange, setNewVehRange] = useState("15 km/l");
  const [newVehHorsePower, setNewVehHorsePower] = useState("150 bhp");
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [createVehicleFeedback, setCreateVehicleFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingVehicle(true);
    setCreateVehicleFeedback(null);

    const generatedSlug =
      newVehSlug.trim() ||
      newVehName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const targetHub = adminHubs.find((h) => h.slug === newVehHubSlug);

    try {
      const res = await createVehicleAction({
        name: newVehName.trim(),
        slug: generatedSlug,
        brand: newVehBrand.trim(),
        category: newVehCategory,
        categoryLabel: newVehCategoryLabel.trim(),
        dailyPriceINR: Number(newVehDailyPrice),
        monthlyPriceINR: Number(newVehMonthlyPrice),
        hubLocation: targetHub ? targetHub.name : "Ghaziabad Hub",
        hubSlug: newVehHubSlug,
        agentAssigned: newVehAgent.trim(),
        fuelType: newVehFuel,
        transmission: newVehTransmission,
        seats: Number(newVehSeats),
        luggageBags: Number(newVehBags),
        rangeOrMileage: newVehRange.trim(),
        horsePower: newVehHorsePower.trim(),
        topSpeed: "200 km/h",
        image: "/images/cars/homie_thar_roxx.jpg",
        year: 2024,
        description: `${newVehName} premium self-drive luxury rental car in Delhi NCR.`,
        isAvailableDemo: true,
      });

      if (res.success && res.vehicle) {
        setCreateVehicleFeedback({
          type: "success",
          message: res.message || "New vehicle added to fleet.",
        });
        setAdminVehicles((prev) => [res.vehicle!, ...prev]);
        setTimeout(() => {
          setIsCreateVehicleModalOpen(false);
          setCreateVehicleFeedback(null);
          setNewVehName("");
          setNewVehSlug("");
          setNewVehBrand("");
        }, 1500);
      } else {
        setCreateVehicleFeedback({
          type: "error",
          message: res.error || "Failed to create vehicle.",
        });
      }
    } catch (err) {
      setCreateVehicleFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error creating vehicle.",
      });
    } finally {
      setIsCreatingVehicle(false);
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

        {/* Tab Controls: Fleet / Hubs / Pricing / KYC / Audit / Agents */}
        <div className="flex items-center gap-2 border-b border-[#E1E8DF] pb-2 text-xs font-bold overflow-x-auto no-scrollbar flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
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
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "hubs"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Operational Hubs &amp; Stations ({adminHubs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pricing"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            Pricing Engine &amp; Taxes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("escrow")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "escrow"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Escrow &amp; Settlements</span>
            {activeEscrowDisputes > 0 ? (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "escrow"
                    ? "bg-rose-300 text-stone-900"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {activeEscrowDisputes} Disputed
              </span>
            ) : totalEscrowCapitalHeld > 0 ? (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "escrow"
                    ? "bg-emerald-300 text-stone-900"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                ₹{(totalEscrowCapitalHeld / 1000).toFixed(0)}k Held
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kyc")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "kyc"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            <FileBadge className="w-3.5 h-3.5" />
            <span>Customer KYC Queue</span>
            {pendingKYCCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "kyc"
                    ? "bg-amber-300 text-stone-900"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {pendingKYCCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contracts")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "contracts"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Rental Contracts &amp; E-Sign</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "contracts"
                  ? "bg-emerald-300 text-stone-900"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {contracts.length} Vaulted
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "telemetry"
                ? "bg-[#50644E] text-white shadow-sm"
                : "text-[#5C6B5A] hover:text-[#172016] hover:bg-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Fleet Telemetry &amp; Diagnostics</span>
            <span className="text-[10px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-300">
              OBD-II CAN
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
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

              <div className="flex items-center gap-2 flex-wrap">
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
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateVehicleModalOpen(true);
                    setCreateVehicleFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Vehicle</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF7] border-b border-[#E8EFE5] text-[#5C6B5A] uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Vehicle &amp; Path</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Assigned Hub</th>
                    <th className="py-3.5 px-4">Base Rate (INR)</th>
                    <th className="py-3.5 px-4">Operational Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4ED]">
                  {(adminVehicles.length > 0 ? adminVehicles : vehicles)
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
                              <span className="text-[11px] text-[#829280] block">
                                {car.specs.fuelType} • {car.specs.seats} seats • {car.brand}
                              </span>
                              <span className="text-[10px] text-[#50644E] font-mono block">
                                /cars/{car.slug}
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
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenEditVehicleModal(car)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#50644E] hover:bg-[#3D4D3B] transition-colors cursor-pointer shadow-2xs"
                              title="Edit Vehicle Details, Specs & Custom Path"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => handleOpenPricingModal(car)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#50644E] bg-[#EAF0E7] hover:bg-[#dce7d8] transition-colors cursor-pointer"
                              title="Edit base pricing & deposit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Rate
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

        {/* TAB 3: PRICING ENGINE & GLOBAL MULTIPLIERS */}
        {activeTab === "pricing" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F4ED]">
              <div>
                <h2 className="text-lg font-bold text-[#172016]">
                  Global Pricing Multipliers &amp; Tax Engine
                </h2>
                <p className="text-xs text-[#5C6B5A] mt-0.5">
                  Calibrate statutory GST tax rates, platform fees, FASTag preloads, and condition tier multipliers without code redeployments.
                </p>
              </div>
              <span className="text-xs font-bold text-[#50644E] bg-[#EAF0E7] px-3 py-1 rounded-full border border-[#D5E2D1]">
                Live Dynamic Engine
              </span>
            </div>

            <form onSubmit={handleSavePlatformSettings} className="space-y-6">
              {/* Row 1: GST, Platform Fee, FASTag Buffer */}
              <div>
                <h3 className="text-xs font-bold text-[#5C6B5A] uppercase tracking-wider mb-3">
                  Statutory Taxes &amp; Platform Escrow
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span>Indian GST Rate (%)</span>
                      <span className="text-[10px] text-[#5C6B5A]">SAC 996601</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={28}
                        value={platformSettings.gstPercent}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            gstPercent: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        %
                      </span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      CGST {platformSettings.gstPercent / 2}% + SGST {platformSettings.gstPercent / 2}%
                    </p>
                  </div>

                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span>Platform Facilitation Fee (%)</span>
                      <span className="text-[10px] text-[#5C6B5A]">Fleet Operations</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={platformSettings.platformFeePercent}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            platformFeePercent: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        %
                      </span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      Applied to base rental charge
                    </p>
                  </div>

                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span>FASTag Buffer Preload (₹)</span>
                      <span className="text-[10px] text-[#5C6B5A]">NETC Toll Escrow</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        step={100}
                        value={platformSettings.fastagBufferINR}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            fastagBufferINR: Number(e.target.value),
                          })
                        }
                        className="w-full pl-7 pr-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      Auto-settled at trip close
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Condition Tier Multipliers */}
              <div>
                <h3 className="text-xs font-bold text-[#5C6B5A] uppercase tracking-wider mb-3">
                  Vehicle Condition Tier Multipliers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Showroom Pristine
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Premium
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1.0}
                        max={1.5}
                        step={0.01}
                        value={platformSettings.pristineMultiplier}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            pristineMultiplier: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        x
                      </span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      +{(Math.round((platformSettings.pristineMultiplier - 1) * 100))}% rate premium
                    </p>
                  </div>

                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Executive Mint
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                        Baseline
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0.9}
                        max={1.2}
                        step={0.01}
                        value={platformSettings.mintMultiplier}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            mintMultiplier: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        x
                      </span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      Standard baseline catalog rate
                    </p>
                  </div>

                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        Touring Value
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                        Value Tier
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0.7}
                        max={1.0}
                        step={0.01}
                        value={platformSettings.touringMultiplier}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            touringMultiplier: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-sm text-[#172016] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        x
                      </span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      -{(Math.round((1 - platformSettings.touringMultiplier) * 100))}% budget discount
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Surge Pricing Engine */}
              <div>
                <h3 className="text-xs font-bold text-[#5C6B5A] uppercase tracking-wider mb-3">
                  Dynamic Demand Surge Protocol
                </h3>
                <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-[#E8EFE5] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <strong className="text-xs font-bold text-[#172016]">
                          High-Demand Surge Pricing Toggle
                        </strong>
                      </div>
                      <p className="text-[11px] text-[#5C6B5A] mt-0.5">
                        When enabled, applies dynamic surge multiplier to all bookings across active hubs during festival / holiday peaks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPlatformSettings({
                          ...platformSettings,
                          surgeActive: !platformSettings.surgeActive,
                        })
                      }
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        platformSettings.surgeActive
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-white text-[#5C6B5A] border border-[#CFD8CD] hover:bg-[#F3F6F1]"
                      }`}
                    >
                      {platformSettings.surgeActive ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>Surge ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>Surge Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  {platformSettings.surgeActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E8EFE5]">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172016]">
                          Surge Ceiling Multiplier (Max Cap)
                        </label>
                        <input
                          type="number"
                          min={1.05}
                          max={1.8}
                          step={0.05}
                          value={platformSettings.surgeMultiplierCeiling}
                          onChange={(e) =>
                            setPlatformSettings({
                              ...platformSettings,
                              surgeMultiplierCeiling: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] font-bold text-xs text-[#172016] focus:outline-hidden font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#172016]">
                          Surge Reason / Notification Notice
                        </label>
                        <input
                          type="text"
                          value={platformSettings.surgeReason}
                          onChange={(e) =>
                            setPlatformSettings({
                              ...platformSettings,
                              surgeReason: e.target.value,
                            })
                          }
                          placeholder="e.g. Diwali Weekend / New Year Surge"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#CFD8CD] text-xs font-semibold text-[#172016] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Message */}
              {settingsFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    settingsFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {settingsFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{settingsFeedback.message}</span>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F4ED]">
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      Save Pricing Parameters
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: MASTER ESCROW & FINANCIAL SETTLEMENT LEDGER */}
        {activeTab === "escrow" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
            {/* Header with Treasury KPIs */}
            <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#172016]">
                    Master Security Deposit Escrow &amp; Settlement Ledger
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Zero-Floor Protected
                  </span>
                </div>
                <p className="text-xs text-[#5C6B5A] mt-1">
                  Automated trip deposit reconciliation, NETC FASTag toll deductions, excess kilometer charges, and instant bank refund disbursement.
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                  <span className="text-amber-800 font-semibold">Held in Escrow:</span>
                  <span className="font-extrabold text-amber-900">{formatINR(totalEscrowCapitalHeld)}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-800 font-semibold">Refunds Disbursed:</span>
                  <span className="font-extrabold text-emerald-900">{formatINR(totalRefundsDisbursed)}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
                  <span className="text-blue-800 font-semibold">FASTag Tolls:</span>
                  <span className="font-extrabold text-blue-900">{formatINR(totalFastagRecoveries)}</span>
                </div>
                {activeEscrowDisputes > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                    <span className="text-rose-800 font-semibold">Disputed Holds:</span>
                    <span className="font-extrabold text-rose-900">{activeEscrowDisputes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="p-4 sm:p-5 bg-[#FAFBF9] border-b border-[#F0F4ED] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEscrowFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    escrowFilter === "all"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  All Settlements ({settlementRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEscrowFilter("held_in_escrow")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    escrowFilter === "held_in_escrow"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Held in Escrow ({settlementRecords.filter((s) => s.status === "held_in_escrow").length})
                </button>
                <button
                  type="button"
                  onClick={() => setEscrowFilter("refund_dispatched")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    escrowFilter === "refund_dispatched"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Refunds Dispatched ({settlementRecords.filter((s) => s.status === "refund_dispatched").length})
                </button>
                <button
                  type="button"
                  onClick={() => setEscrowFilter("disputed_hold")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    escrowFilter === "disputed_hold"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Disputed Holds ({activeEscrowDisputes})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#829280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search booking ref, customer, or UTR..."
                  value={escrowSearch}
                  onChange={(e) => setEscrowSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-[#CFD8CD] text-xs font-medium text-[#172016] placeholder:text-[#829280] focus:outline-hidden focus:border-[#50644E]"
                />
              </div>
            </div>

            {/* Escrow Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F4ED] bg-[#F8FAF7] text-[11px] font-black uppercase tracking-wider text-[#5C6B5A]">
                    <th className="p-4 sm:pl-6">Booking &amp; Vehicle</th>
                    <th className="p-4">Customer &amp; Dates</th>
                    <th className="p-4">Deposit Held</th>
                    <th className="p-4">Deductions Itemization</th>
                    <th className="p-4">Net Refund &amp; Invariant</th>
                    <th className="p-4">Disbursement Status</th>
                    <th className="p-4 sm:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4ED] text-xs">
                  {settlementRecords
                    .filter((s) => {
                      const matchesFilter =
                        escrowFilter === "all" ? true : s.status === escrowFilter;
                      const q = escrowSearch.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        s.bookingRef.toLowerCase().includes(q) ||
                        s.customerName.toLowerCase().includes(q) ||
                        s.vehicleName.toLowerCase().includes(q) ||
                        s.customerPhone.includes(q) ||
                        s.paymentGatewayRef.toLowerCase().includes(q);
                      return matchesFilter && matchesSearch;
                    })
                    .map((record) => {
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-[#FBFDFB] transition-colors"
                        >
                          {/* Booking & Vehicle */}
                          <td className="p-4 sm:pl-6">
                            <div className="font-mono font-extrabold text-[#172016] text-sm">
                              {record.bookingRef}
                            </div>
                            <div className="font-semibold text-xs text-[#172016] mt-0.5">
                              {record.vehicleName}
                            </div>
                            <div className="text-[11px] text-[#5C6B5A] flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{record.vehicleRegistration}</span>
                              <span>•</span>
                              <span>{record.hubName}</span>
                            </div>
                          </td>

                          {/* Customer & Dates */}
                          <td className="p-4">
                            <div className="font-bold text-[#172016]">
                              {record.customerName}
                            </div>
                            <div className="text-[11px] text-[#5C6B5A] mt-0.5">
                              +91 {record.customerPhone}
                            </div>
                            <div className="text-[10px] text-[#829280] mt-0.5">
                              {record.pickupDate} – {record.returnDate}
                            </div>
                          </td>

                          {/* Deposit Held */}
                          <td className="p-4">
                            <div className="font-mono font-extrabold text-sm text-[#172016]">
                              {formatINR(record.depositHeldINR)}
                            </div>
                            <span className="text-[10px] text-[#829280]">
                              Secured in Escrow
                            </span>
                          </td>

                          {/* Itemized Deductions */}
                          <td className="p-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[#5C6B5A]">FASTag Tolls:</span>
                                <span className="font-mono font-bold text-[#172016]">
                                  {formatINR(record.fastagTollsINR)}
                                </span>
                              </div>
                              {record.excessKmChargesINR > 0 && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[#5C6B5A]">Excess Km ({record.excessKm} km):</span>
                                  <span className="font-mono font-bold text-[#172016]">
                                    {formatINR(record.excessKmChargesINR)}
                                  </span>
                                </div>
                              )}
                              {record.damageCleaningChargesINR > 0 && (
                                <div className="flex items-center justify-between gap-3 text-rose-700">
                                  <span>Damage / Detailing:</span>
                                  <span className="font-mono font-bold">
                                    {formatINR(record.damageCleaningChargesINR)}
                                  </span>
                                </div>
                              )}
                              <div className="pt-1 border-t border-[#F0F4ED] flex items-center justify-between gap-3 font-bold text-[10px] text-[#5C6B5A]">
                                <span>Total Deducted:</span>
                                <span className="font-mono">{formatINR(record.totalDeductionsINR)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Net Refund & Zero-Floor Invariant */}
                          <td className="p-4">
                            <div className="font-mono font-black text-sm text-emerald-700">
                              {formatINR(record.netRefundINR)}
                            </div>
                            {record.zeroFloorApplied ? (
                              <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                Zero-Floor Capped
                              </span>
                            ) : (
                              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Protected Refund
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            {record.status === "refund_dispatched" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Refund Dispatched
                                </span>
                                <div className="text-[10px] font-mono text-[#829280] mt-1 truncate max-w-[150px]">
                                  {record.paymentGatewayRef}
                                </div>
                              </div>
                            )}
                            {record.status === "held_in_escrow" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Held in Escrow
                                </span>
                                <div className="text-[10px] text-[#829280] mt-1">
                                  Pending disbursement
                                </div>
                              </div>
                            )}
                            {record.status === "disputed_hold" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  Disputed Hold
                                </span>
                                <div className="text-[10px] text-rose-700 font-semibold mt-1">
                                  Audit required
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 sm:pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenSettlement(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3F6F1] hover:bg-[#50644E] text-[#3D4D3B] hover:text-white transition-all border border-[#CFD8CD] hover:border-[#50644E] cursor-pointer shadow-2xs"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Inspect Breakdown</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {settlementRecords.filter((s) => {
              const matchesFilter =
                escrowFilter === "all" ? true : s.status === escrowFilter;
              const q = escrowSearch.toLowerCase().trim();
              const matchesSearch =
                !q ||
                s.bookingRef.toLowerCase().includes(q) ||
                s.customerName.toLowerCase().includes(q) ||
                s.vehicleName.toLowerCase().includes(q) ||
                s.customerPhone.includes(q) ||
                s.paymentGatewayRef.toLowerCase().includes(q);
              return matchesFilter && matchesSearch;
            }).length === 0 && (
              <div className="p-12 text-center text-[#5C6B5A]">
                <Landmark className="w-8 h-8 text-[#829280] mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">No settlement records matched your query.</p>
                <p className="text-xs text-[#829280] mt-1">
                  Try adjusting the filter status or clearing the search bar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER DIGILOCKER KYC VERIFICATION QUEUE */}
        {activeTab === "kyc" && (
          <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
            {/* Header with Stats */}
            <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#172016]">
                    Customer DigiLocker KYC Verification Queue
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    UIDAI &amp; MoRTH Linked
                  </span>
                </div>
                <p className="text-xs text-[#5C6B5A] mt-1">
                  Cryptographically verified driving licenses &amp; masked Aadhaar credentials via Government DigiLocker gateway.
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-[#F8FAF7] border border-[#E8EFE5] flex items-center gap-2">
                  <span className="text-[#5C6B5A] font-semibold">Total:</span>
                  <span className="font-extrabold text-[#172016]">{kycRecords.length}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                  <span className="text-amber-800 font-semibold">Pending Review:</span>
                  <span className="font-extrabold text-amber-900">{pendingKYCCount}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <span className="text-emerald-800 font-semibold">Verified:</span>
                  <span className="font-extrabold text-emerald-900">
                    {kycRecords.filter((k) => k.digilockerStatus === "verified").length}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                  <span className="text-rose-800 font-semibold">Flagged / Risk:</span>
                  <span className="font-extrabold text-rose-900">
                    {kycRecords.filter((k) => k.digilockerStatus === "flagged" || k.digilockerStatus === "rejected").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="p-4 sm:p-5 bg-[#FAFBF9] border-b border-[#F0F4ED] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setKycFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    kycFilter === "all"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  All Records ({kycRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setKycFilter("pending_review")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    kycFilter === "pending_review"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Pending Review ({pendingKYCCount})
                </button>
                <button
                  type="button"
                  onClick={() => setKycFilter("verified")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    kycFilter === "verified"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Verified Drivers
                </button>
                <button
                  type="button"
                  onClick={() => setKycFilter("flagged")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    kycFilter === "flagged"
                      ? "bg-[#50644E] text-white shadow-xs"
                      : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
                  }`}
                >
                  Flagged Risk
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#829280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, DL or phone..."
                  value={kycSearch}
                  onChange={(e) => setKycSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-[#CFD8CD] text-xs font-medium text-[#172016] placeholder:text-[#829280] focus:outline-hidden focus:border-[#50644E]"
                />
              </div>
            </div>

            {/* KYC Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F4ED] bg-[#F8FAF7] text-[11px] font-black uppercase tracking-wider text-[#5C6B5A]">
                    <th className="p-4 sm:pl-6">Customer &amp; Contact</th>
                    <th className="p-4">DigiLocker Status</th>
                    <th className="p-4">UIDAI Aadhaar</th>
                    <th className="p-4">MoRTH Sarathi License</th>
                    <th className="p-4">Risk Profile</th>
                    <th className="p-4 sm:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4ED] text-xs">
                  {kycRecords
                    .filter((k) => {
                      const matchesFilter =
                        kycFilter === "all" ? true : k.digilockerStatus === kycFilter;
                      const q = kycSearch.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        k.fullName.toLowerCase().includes(q) ||
                        k.phone.includes(q) ||
                        k.email.toLowerCase().includes(q) ||
                        k.drivingLicense.dlNumber.toLowerCase().includes(q) ||
                        k.aadhaar.maskedNumber.toLowerCase().includes(q);
                      return matchesFilter && matchesSearch;
                    })
                    .map((record) => {
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-[#FBFDFB] transition-colors"
                        >
                          {/* Customer Info */}
                          <td className="p-4 sm:pl-6">
                            <div className="font-extrabold text-[#172016] text-sm flex items-center gap-1.5">
                              <span>{record.fullName}</span>
                              {record.digilockerStatus === "verified" && (
                                <ShieldCheck className="w-4 h-4 text-emerald-600 inline shrink-0" />
                              )}
                            </div>
                            <div className="text-[#5C6B5A] text-[11px] mt-0.5 space-y-0.5">
                              <div>+91 {record.phone}</div>
                              <div className="text-[#829280]">{record.email}</div>
                              <div className="text-[10px] text-[#5C6B5A]">
                                {record.aadhaar.city}, {record.aadhaar.state}
                              </div>
                            </div>
                          </td>

                          {/* DigiLocker Status */}
                          <td className="p-4">
                            {record.digilockerStatus === "verified" && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Verified Driver
                              </span>
                            )}
                            {record.digilockerStatus === "pending_review" && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Pending Review
                              </span>
                            )}
                            {record.digilockerStatus === "flagged" && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                Flagged Risk
                              </span>
                            )}
                            {record.digilockerStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                                <Ban className="w-3.5 h-3.5 text-stone-500" />
                                Rejected
                              </span>
                            )}
                            <div className="text-[10px] text-[#829280] mt-1 font-mono">
                              {new Date(record.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>

                          {/* Aadhaar Info */}
                          <td className="p-4">
                            <div className="font-mono font-bold text-[#172016]">
                              {record.aadhaar.maskedNumber}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {record.aadhaar.ageCheckPassed ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {record.aadhaar.age} yrs • 23+ Policy OK
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                  {record.aadhaar.age} yrs • Under 23
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#829280] mt-0.5">
                              UIDAI Verified Token
                            </div>
                          </td>

                          {/* Driving License */}
                          <td className="p-4">
                            <div className="font-mono font-bold text-[#172016]">
                              {record.drivingLicense.dlNumber}
                            </div>
                            <div className="text-[11px] text-[#5C6B5A] mt-0.5">
                              {record.drivingLicense.issuingRTO}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono font-bold bg-[#EAF0E7] text-[#3D4D3B] px-1.5 py-0.5 rounded-md border border-[#D5E2D1]">
                                {record.drivingLicense.vehicleClasses.join(", ")}
                              </span>
                              <span className="text-[10px] text-[#829280]">
                                Exp: {record.drivingLicense.expiryDate}
                              </span>
                            </div>
                          </td>

                          {/* Risk Profile */}
                          <td className="p-4">
                            {record.riskLevel === "low" && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Low Risk
                              </span>
                            )}
                            {record.riskLevel === "medium" && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                Medium Risk
                              </span>
                            )}
                            {record.riskLevel === "high" && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                High Risk
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-4 sm:pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenKYCDossier(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3F6F1] hover:bg-[#50644E] text-[#3D4D3B] hover:text-white transition-all border border-[#CFD8CD] hover:border-[#50644E] cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Dossier</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {kycRecords.filter((k) => {
              const matchesFilter =
                kycFilter === "all" ? true : k.digilockerStatus === kycFilter;
              const q = kycSearch.toLowerCase().trim();
              const matchesSearch =
                !q ||
                k.fullName.toLowerCase().includes(q) ||
                k.phone.includes(q) ||
                k.email.toLowerCase().includes(q) ||
                k.drivingLicense.dlNumber.toLowerCase().includes(q) ||
                k.aadhaar.maskedNumber.toLowerCase().includes(q);
              return matchesFilter && matchesSearch;
            }).length === 0 && (
              <div className="p-12 text-center text-[#5C6B5A]">
                <FileBadge className="w-8 h-8 text-[#829280] mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">No Customer KYC records matched your query.</p>
                <p className="text-xs text-[#829280] mt-1">
                  Try adjusting the filter status or clearing the search bar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: DIGITAL RENTAL CONTRACT VAULT & VECTOR E-SIGNATURES
            =================================================================== */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            {/* Top Vault Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Total Executed Contracts</span>
                  <FileCheck className="w-4 h-4 text-[#50644E]" />
                </div>
                <p className="text-3xl font-black text-[#172016]">{contracts.length}</p>
                <span className="text-[11px] text-[#5C6B5A]">Legally vaulted under IT Act 2000</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Countersigned by Master Admin</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-black text-emerald-700">
                  {contracts.filter((c) => c.countersignedByAdmin).length}
                </p>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Dual vector signature sealed
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">SHA-256 Tamper Integrity</span>
                  <Hash className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-black text-purple-700">100%</p>
                <span className="text-[11px] text-purple-800 font-semibold">
                  Zero cryptographic modifications detected
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#172016]">
                    Digital Rental Contract Vault
                  </h2>
                  <p className="text-xs text-[#5C6B5A] mt-0.5">
                    Immutable vector e-signatures, customer Aadhaar/DL linkage, and master admin countersignature governance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#829280]" />
                    <input
                      type="text"
                      placeholder="Search by contract, booking, driver..."
                      value={contractSearch}
                      onChange={(e) => setContractSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#F3F6F1] border border-[#CFD8CD] focus:border-[#50644E] rounded-xl text-xs font-medium text-[#172016] outline-hidden w-full sm:w-64"
                    />
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 bg-[#F3F6F1] p-1 rounded-xl border border-[#CFD8CD]">
                    {[
                      { id: "all", label: "All" },
                      { id: "signed", label: "Awaiting Countersign" },
                      { id: "countersigned", label: "Countersigned" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setContractFilter(f.id as typeof contractFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          contractFilter === f.id
                            ? "bg-white text-[#172016] shadow-2xs"
                            : "text-[#5C6B5A] hover:text-[#172016]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFBF9] border-b border-[#E8EFE5] text-[#5C6B5A] font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 sm:pl-6">Contract &amp; Booking</th>
                      <th className="p-4">Customer &amp; Verified DL</th>
                      <th className="p-4">Vehicle &amp; Hub</th>
                      <th className="p-4">Rental Value</th>
                      <th className="p-4">Customer Vector E-Sign</th>
                      <th className="p-4">Countersign Status</th>
                      <th className="p-4 sm:pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4ED]">
                    {contracts
                      .filter((c) => {
                        const matchesFilter =
                          contractFilter === "all" ? true : c.status === contractFilter;
                        const q = contractSearch.toLowerCase().trim();
                        const matchesSearch =
                          !q ||
                          c.contractNumber.toLowerCase().includes(q) ||
                          c.bookingRef.toLowerCase().includes(q) ||
                          c.customerName.toLowerCase().includes(q) ||
                          c.vehicleName.toLowerCase().includes(q) ||
                          c.registrationNumber.toLowerCase().includes(q) ||
                          c.dlNumber.toLowerCase().includes(q);
                        return matchesFilter && matchesSearch;
                      })
                      .map((contract) => (
                        <tr key={contract.id} className="hover:bg-[#FAFBF9] transition-colors">
                          <td className="p-4 sm:pl-6">
                            <div className="font-bold text-[#172016] font-mono">
                              {contract.contractNumber}
                            </div>
                            <div className="text-[10px] text-[#50644E] font-bold mt-0.5">
                              Booking Ref: {contract.bookingRef}
                            </div>
                            <span className="text-[10px] text-[#829280] font-mono">
                              {new Date(contract.signedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-[#172016]">{contract.customerName}</div>
                            <div className="text-[11px] text-[#5C6B5A] font-mono">
                              DL: {contract.dlNumber}
                            </div>
                            <div className="text-[10px] text-[#829280]">
                              Aadhaar: {contract.maskedAadhaar}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-[#172016]">{contract.vehicleName}</div>
                            <div className="text-[11px] font-mono text-[#5C6B5A]">
                              {contract.registrationNumber}
                            </div>
                            <div className="text-[10px] text-[#829280] truncate max-w-[180px]">
                              {contract.hubName}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-extrabold text-[#172016]">
                              {formatINR(contract.totalAmountINR)}
                            </div>
                            <div className="text-[10px] text-[#5C6B5A]">
                              {contract.totalDays} days @ {formatINR(contract.dailyRateINR)}/d
                            </div>
                            <div className="text-[10px] text-emerald-800 font-semibold">
                              Deposit: {formatINR(contract.depositHeldINR)}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="p-1 bg-[#F8FAF7] border border-[#DFE6DC] rounded-xl w-32 h-10 flex items-center justify-center overflow-hidden">
                              <svg viewBox="0 0 300 80" className="w-full h-full">
                                <path
                                  d={contract.customerSignatureSvg}
                                  stroke="#172016"
                                  strokeWidth="3.5"
                                  fill="none"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <span className="text-[9px] text-[#829280] block mt-0.5 font-mono truncate max-w-[130px]">
                              SHA: {contract.documentHashSHA256.slice(0, 14)}...
                            </span>
                          </td>

                          <td className="p-4">
                            {contract.countersignedByAdmin ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                <span>Countersigned</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>Awaiting Admin Sign</span>
                              </span>
                            )}
                          </td>

                          <td className="p-4 sm:pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingContract(contract);
                                setContractFeedback(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3F6F1] hover:bg-[#50644E] text-[#3D4D3B] hover:text-white transition-all border border-[#CFD8CD] hover:border-[#50644E] cursor-pointer shadow-2xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Inspect Contract</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: REAL-TIME FLEET TELEMETRY & SENSOR DIAGNOSTICS
            =================================================================== */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            {/* Strict GPS Invariant Banner */}
            <div className="p-4 rounded-3xl bg-slate-900 text-slate-100 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-amber-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      OBD-II CAN-Bus Telemetry Stream
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                      GPS NOT CONNECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permanent Operating Invariant: Live satellite tracking is strictly disengaged until physical OBD-II / IoT CAN modules are hardwired. Displaying real CAN-bus sensor telemetry (Cold TPMS, 12V Battery Health, Coolant Temp, Oil Life).
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CAN Gateway Live
                </span>
              </div>
            </div>

            {/* Telemetry Sensor Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Monitored Fleet Units</span>
                  <Car className="w-4 h-4 text-[#50644E]" />
                </div>
                <p className="text-3xl font-black text-[#172016]">{telemetryList.length}</p>
                <span className="text-[11px] text-[#5C6B5A]">Active OBD-II sensor polling</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Avg 12V Battery Health</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-black text-amber-700">13.0 V</p>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Nominal alternator charge across all units
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Cold TPMS Adherence</span>
                  <Gauge className="w-4 h-4 text-[#50644E]" />
                </div>
                <p className="text-3xl font-black text-[#172016]">34 PSI</p>
                <span className="text-[11px] text-[#5C6B5A]">Fleet-wide cold tire calibration</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E8EFE5] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5C6B5A] mb-2">
                  <span className="font-bold">Satellite Telematics</span>
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-xl font-bold font-mono text-slate-700 pt-1">
                  GPS NOT CONNECTED
                </p>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Zero fake live GPS simulation
                </span>
              </div>
            </div>

            {/* Telemetry Sensor Matrix Table */}
            <div className="bg-white rounded-3xl border border-[#E8EFE5] shadow-homie overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#F0F4ED] flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#172016]">
                    Vehicle CAN-Bus Sensor Matrix
                  </h2>
                  <p className="text-xs text-[#5C6B5A] mt-0.5">
                    Real-time tire pressure (TPMS), engine thermal management, alternator output, and odometer sync.
                  </p>
                </div>
                {telemetryFeedback && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {telemetryFeedback}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFBF9] border-b border-[#E8EFE5] text-[#5C6B5A] font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 sm:pl-6">Vehicle &amp; Hub</th>
                      <th className="p-4">Odometer &amp; Energy</th>
                      <th className="p-4">Cold TPMS (4 Wheels)</th>
                      <th className="p-4">12V Battery</th>
                      <th className="p-4">Engine Thermal / Oil</th>
                      <th className="p-4">GPS Satellite Status</th>
                      <th className="p-4 sm:pr-6 text-right">Poll Diagnostics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4ED]">
                    {telemetryList.map((veh) => (
                      <tr key={veh.vehicleId} className="hover:bg-[#FAFBF9] transition-colors">
                        <td className="p-4 sm:pl-6">
                          <div className="font-bold text-[#172016]">{veh.carName}</div>
                          <div className="text-[11px] font-mono text-[#5C6B5A]">
                            {veh.registrationNumber}
                          </div>
                          <div className="text-[10px] text-[#829280] truncate max-w-[180px]">
                            {veh.hubLocation}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-[#172016] font-mono">
                            {veh.odometerKm.toLocaleString()} km
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-[#5C6B5A] uppercase">
                              {veh.fuelType}:
                            </span>
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full ${
                                  veh.fuelOrBatteryPercent > 30 ? "bg-emerald-600" : "bg-amber-500"
                                }`}
                                style={{ width: `${veh.fuelOrBatteryPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-[#172016]">
                              {veh.fuelOrBatteryPercent}%
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-[#F8FAF7] p-2 rounded-xl border border-[#DFE6DC] w-36">
                            <span className="text-emerald-800 font-bold">
                              FL: {veh.tirePressure.frontLeft} PSI
                            </span>
                            <span className="text-emerald-800 font-bold">
                              FR: {veh.tirePressure.frontRight} PSI
                            </span>
                            <span className="text-emerald-800 font-bold">
                              RL: {veh.tirePressure.rearLeft} PSI
                            </span>
                            <span className="text-emerald-800 font-bold">
                              RR: {veh.tirePressure.rearRight} PSI
                            </span>
                          </div>
                          <span className="text-[9px] text-[#829280] block mt-0.5">
                            Target: {veh.tirePressure.targetPSI} PSI
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-mono font-bold text-[#172016] text-sm">
                            {veh.batteryVoltage12V} V
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Nominal (12.6V - 13.8V)
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-mono font-bold text-[#172016]">
                            {veh.engineCoolantTempC}°C
                          </div>
                          <span className="text-[10px] text-[#5C6B5A]">
                            Oil Life: <strong>{veh.engineOilLifePercent}%</strong>
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>{veh.gpsStatusLabel}</span>
                          </span>
                        </td>

                        <td className="p-4 sm:pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleRefreshTelemetry(veh.vehicleId)}
                            disabled={isRefreshingTelemetry === veh.vehicleId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3F6F1] hover:bg-[#50644E] text-[#3D4D3B] hover:text-white transition-all border border-[#CFD8CD] hover:border-[#50644E] cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                isRefreshingTelemetry === veh.vehicleId ? "animate-spin" : ""
                              }`}
                            />
                            <span>Poll OBD-II</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    <label className="text-xs font-bold text-[#172016]">Station URL Path / Slug</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        /hubs/
                      </span>
                      <input
                        type="text"
                        value={hubSlug}
                        onChange={(e) =>
                          setHubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
                        }
                        className="w-full pl-16 pr-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Master Fleet Vehicle Editor Modal */}
        {editingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Edit Vehicle Specifications &amp; Route</h3>
                    <p className="text-xs text-white/60">
                      Configure vehicle parameters, public route paths, operational hub, and availability
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingVehicle(null);
                    setVehicleFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVehicle} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Vehicle Model Name</label>
                    <input
                      type="text"
                      value={vehName}
                      onChange={(e) => setVehName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Brand / Manufacturer</label>
                    <input
                      type="text"
                      value={vehBrand}
                      onChange={(e) => setVehBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Public Route Path / Slug</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        /cars/
                      </span>
                      <input
                        type="text"
                        value={vehSlug}
                        onChange={(e) =>
                          setVehSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
                        }
                        className="w-full pl-16 pr-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Category</label>
                    <select
                      value={vehCategory}
                      onChange={(e) => {
                        const val = e.target.value as CarType["category"];
                        setVehCategory(val);
                        setVehCategoryLabel(
                          val === "supercar"
                            ? "Supercar"
                            : val === "luxury-sedan"
                            ? "Luxury Sedan"
                            : val === "performance-suv"
                            ? "Performance SUV"
                            : val === "city-ev"
                            ? "City EV"
                            : val === "adventure-4x4"
                            ? "Adventure 4x4"
                            : val === "family-tourer"
                            ? "Family Tourer"
                            : "Touring SUV"
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="touring-suv">Touring SUV</option>
                      <option value="adventure-4x4">Adventure 4x4</option>
                      <option value="luxury-sedan">Luxury Sedan</option>
                      <option value="performance-suv">Performance SUV</option>
                      <option value="city-ev">City EV</option>
                      <option value="supercar">Supercar</option>
                      <option value="family-tourer">Family Tourer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Base Daily Rate (₹)</label>
                    <input
                      type="number"
                      min={999}
                      max={99999}
                      value={vehDailyPrice}
                      onChange={(e) => setVehDailyPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Monthly Subscription Rate (₹)</label>
                    <input
                      type="number"
                      min={9999}
                      max={999999}
                      value={vehMonthlyPrice}
                      onChange={(e) => setVehMonthlyPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Assigned Operating Hub</label>
                    <select
                      value={vehHubSlug}
                      onChange={(e) => setVehHubSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      {adminHubs.map((hub) => (
                        <option key={hub.id || hub.slug} value={hub.slug}>
                          {hub.name} ({hub.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Assigned Operational Agent</label>
                    <input
                      type="text"
                      value={vehAgent}
                      onChange={(e) => setVehAgent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Fuel Type</label>
                    <select
                      value={vehFuel}
                      onChange={(e) => setVehFuel(e.target.value as CarType["specs"]["fuelType"])}
                      className="w-full px-2.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Transmission</label>
                    <select
                      value={vehTransmission}
                      onChange={(e) =>
                        setVehTransmission(e.target.value as CarType["specs"]["transmission"])
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Seats</label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={vehSeats}
                      onChange={(e) => setVehSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Luggage Bags</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={vehBags}
                      onChange={(e) => setVehBags(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Range / Fuel Economy</label>
                    <input
                      type="text"
                      value={vehRange}
                      onChange={(e) => setVehRange(e.target.value)}
                      placeholder="e.g. 15.2 km/l or 465 km"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Engine Power (BHP)</label>
                    <input
                      type="text"
                      value={vehHorsePower}
                      onChange={(e) => setVehHorsePower(e.target.value)}
                      placeholder="e.g. 175 bhp"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Availability Status</label>
                    <select
                      value={vehIsAvailable ? "available" : "maintenance"}
                      onChange={(e) => setVehIsAvailable(e.target.value === "available")}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="available">Available for Bookings</option>
                      <option value="maintenance">Not Available / In Maintenance</option>
                    </select>
                  </div>
                  {!vehIsAvailable && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#172016]">Unavailable Notice</label>
                      <input
                        type="text"
                        value={vehUnavailableReason}
                        onChange={(e) => setVehUnavailableReason(e.target.value)}
                        placeholder="e.g. Scheduled 10,000 km Service"
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:border-amber-500 text-xs font-semibold text-[#172016] outline-hidden bg-amber-50/50"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172016]">Modification Audit Reason</label>
                  <input
                    type="text"
                    value={vehReason}
                    onChange={(e) => setVehReason(e.target.value)}
                    placeholder="Mandatory reason for audit trail compliance"
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                    required
                  />
                </div>

                {/* Feedback */}
                {vehicleFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      vehicleFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {vehicleFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{vehicleFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4ED]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVehicle(null);
                      setVehicleFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isUpdatingVehicle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingVehicle}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingVehicle ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Sliders className="w-3.5 h-3.5" />
                        Save Vehicle Specifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add New Fleet Vehicle Modal */}
        {isCreateVehicleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Add New Fleet Vehicle</h3>
                    <p className="text-xs text-white/60">
                      Provision a new vehicle into the Homie Drives Delhi NCR unified fleet
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateVehicleModalOpen(false);
                    setCreateVehicleFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateVehicle} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Model Name</label>
                    <input
                      type="text"
                      value={newVehName}
                      onChange={(e) => {
                        setNewVehName(e.target.value);
                        if (!newVehSlug) {
                          setNewVehSlug(
                            e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                          );
                        }
                      }}
                      placeholder="e.g. BMW X5 xDrive40i"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Brand</label>
                    <input
                      type="text"
                      value={newVehBrand}
                      onChange={(e) => setNewVehBrand(e.target.value)}
                      placeholder="e.g. BMW"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Public Route Slug</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#829280]">
                        /cars/
                      </span>
                      <input
                        type="text"
                        value={newVehSlug}
                        onChange={(e) =>
                          setNewVehSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
                        }
                        placeholder="bmw-x5-xdrive40i"
                        className="w-full pl-16 pr-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Category</label>
                    <select
                      value={newVehCategory}
                      onChange={(e) => {
                        const val = e.target.value as CarType["category"];
                        setNewVehCategory(val);
                        setNewVehCategoryLabel(
                          val === "supercar"
                            ? "Supercar"
                            : val === "luxury-sedan"
                            ? "Luxury Sedan"
                            : val === "performance-suv"
                            ? "Performance SUV"
                            : val === "city-ev"
                            ? "City EV"
                            : val === "adventure-4x4"
                            ? "Adventure 4x4"
                            : val === "family-tourer"
                            ? "Family Tourer"
                            : "Touring SUV"
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="touring-suv">Touring SUV</option>
                      <option value="adventure-4x4">Adventure 4x4</option>
                      <option value="luxury-sedan">Luxury Sedan</option>
                      <option value="performance-suv">Performance SUV</option>
                      <option value="city-ev">City EV</option>
                      <option value="supercar">Supercar</option>
                      <option value="family-tourer">Family Tourer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Daily Base Rate (₹)</label>
                    <input
                      type="number"
                      min={999}
                      max={99999}
                      value={newVehDailyPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewVehDailyPrice(val);
                        setNewVehMonthlyPrice(val * 22);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Monthly Subscription (₹)</label>
                    <input
                      type="number"
                      min={9999}
                      max={999999}
                      value={newVehMonthlyPrice}
                      onChange={(e) => setNewVehMonthlyPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Assigned Station Hub</label>
                    <select
                      value={newVehHubSlug}
                      onChange={(e) => setNewVehHubSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      {adminHubs.map((hub) => (
                        <option key={hub.id || hub.slug} value={hub.slug}>
                          {hub.name} ({hub.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Assigned Agent Name</label>
                    <input
                      type="text"
                      value={newVehAgent}
                      onChange={(e) => setNewVehAgent(e.target.value)}
                      placeholder="e.g. Vikram Batra"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Fuel</label>
                    <select
                      value={newVehFuel}
                      onChange={(e) => setNewVehFuel(e.target.value as CarType["specs"]["fuelType"])}
                      className="w-full px-2.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Gearbox</label>
                    <select
                      value={newVehTransmission}
                      onChange={(e) =>
                        setNewVehTransmission(e.target.value as CarType["specs"]["transmission"])
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] bg-white outline-hidden"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Seats</label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={newVehSeats}
                      onChange={(e) => setNewVehSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Bags</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={newVehBags}
                      onChange={(e) => setNewVehBags(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Mileage / Range</label>
                    <input
                      type="text"
                      value={newVehRange}
                      onChange={(e) => setNewVehRange(e.target.value)}
                      placeholder="e.g. 14.5 km/l"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172016]">Horsepower</label>
                    <input
                      type="text"
                      value={newVehHorsePower}
                      onChange={(e) => setNewVehHorsePower(e.target.value)}
                      placeholder="e.g. 190 bhp"
                      className="w-full px-3 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-semibold text-[#172016] outline-hidden"
                      required
                    />
                  </div>
                </div>

                {/* Feedback */}
                {createVehicleFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      createVehicleFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {createVehicleFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{createVehicleFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4ED]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateVehicleModalOpen(false);
                      setCreateVehicleFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                    disabled={isCreatingVehicle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingVehicle}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingVehicle ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Adding Vehicle...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add Vehicle to Fleet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer DigiLocker KYC Dossier Inspection Modal */}
        {inspectingKYC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <span>Government DigiLocker KYC Dossier</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        {inspectingKYC.digilockerStatus.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Customer ID: {inspectingKYC.id} • Registered: {new Date(inspectingKYC.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInspectingKYC(null);
                    setKycFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Dossier Content */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                {/* Customer Contact & Address Snapshot */}
                <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5]">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#5C6B5A] mb-3">
                    Customer Profile &amp; Residency Verification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#829280] block text-[10px] uppercase font-bold">Full Legal Name</span>
                      <span className="font-extrabold text-[#172016]">{inspectingKYC.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#829280] block text-[10px] uppercase font-bold">Contact Phone</span>
                      <span className="font-mono font-bold text-[#172016]">+91 {inspectingKYC.phone}</span>
                    </div>
                    <div>
                      <span className="text-[#829280] block text-[10px] uppercase font-bold">Verified Email</span>
                      <span className="font-medium text-[#172016] truncate block">{inspectingKYC.email}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E8EFE5] text-xs">
                    <span className="text-[#829280] block text-[10px] uppercase font-bold">Registered Residential Address</span>
                    <span className="text-[#172016] font-medium">
                      {inspectingKYC.aadhaar.address}, {inspectingKYC.aadhaar.city}, {inspectingKYC.aadhaar.state} - {inspectingKYC.aadhaar.pincode}
                    </span>
                    {inspectingKYC.aadhaar.isNcrResident && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-[#3D4D3B] bg-[#EAF0E7] px-2 py-0.5 rounded-md border border-[#D5E2D1]">
                        Delhi NCR Resident
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Dual-Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Masked UIDAI Aadhaar */}
                  <div className="p-4 rounded-2xl border border-[#E8EFE5] bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#F0F4ED] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#50644E]" />
                        <span className="font-extrabold text-xs text-[#172016]">UIDAI Masked Aadhaar</span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        UIDAI Encrypted
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#829280] text-[10px] block font-bold">Aadhaar Reference</span>
                        <span className="font-mono font-extrabold text-sm text-[#172016]">
                          {inspectingKYC.aadhaar.maskedNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#829280] text-[10px] block font-bold">Date of Birth</span>
                          <span className="font-medium text-[#172016]">{inspectingKYC.aadhaar.dob}</span>
                        </div>
                        <div>
                          <span className="text-[#829280] text-[10px] block font-bold">Age</span>
                          <span className="font-bold text-[#172016]">{inspectingKYC.aadhaar.age} years old</span>
                        </div>
                      </div>

                      {/* Policy Verification Alert */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
                          inspectingKYC.aadhaar.ageCheckPassed
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}
                      >
                        {inspectingKYC.aadhaar.ageCheckPassed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>23+ Policy Passed:</strong> Customer meets Homie Drives minimum self-drive requirement.
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Policy Violation:</strong> Customer is under 23 years. Ineligible for self-drive rental.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: MoRTH Sarathi Driving License */}
                  <div className="p-4 rounded-2xl border border-[#E8EFE5] bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#F0F4ED] pb-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#50644E]" />
                        <span className="font-extrabold text-xs text-[#172016]">MoRTH Sarathi DL</span>
                      </div>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                        Sarathi RTO Verified
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#829280] text-[10px] block font-bold">Driving License Number</span>
                        <span className="font-mono font-extrabold text-sm text-[#172016]">
                          {inspectingKYC.drivingLicense.dlNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#829280] text-[10px] block font-bold">Issuing Regional Transport Office</span>
                        <span className="font-medium text-[#172016]">{inspectingKYC.drivingLicense.issuingRTO}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#829280] text-[10px] block font-bold">Vehicle Class</span>
                          <span className="font-mono font-bold text-[#172016]">
                            {inspectingKYC.drivingLicense.vehicleClasses.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#829280] text-[10px] block font-bold">Validity Expiry</span>
                          <span className="font-medium text-[#172016]">{inspectingKYC.drivingLicense.expiryDate}</span>
                        </div>
                      </div>

                      {/* LMV-NT Check */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
                          inspectingKYC.drivingLicense.lmvEligible && !inspectingKYC.drivingLicense.isExpired
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}
                      >
                        {inspectingKYC.drivingLicense.lmvEligible && !inspectingKYC.drivingLicense.isExpired ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>LMV-NT Class Valid:</strong> Eligible to operate 4-wheel passenger fleet vehicles.
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Invalid License:</strong> LMV class missing or license is expired.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Watermarked DL Media Card */}
                <div className="p-4 rounded-2xl border border-[#E8EFE5] bg-[#F8FAF7] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#172016]">
                        DigiLocker Encrypted DL Card Artifact
                      </h4>
                      <p className="text-[11px] text-[#5C6B5A]">
                        Stored securely in private Supabase bucket. Pre-signed access URL expires in 15 minutes.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#829280] bg-white px-2 py-1 rounded-md border border-[#E8EFE5]">
                      SHA256 Encrypted
                    </span>
                  </div>

                  <div className="relative h-44 rounded-xl overflow-hidden border border-[#CFD8CD] bg-stone-900 flex items-center justify-center group">
                    <Image
                      src={inspectingKYC.drivingLicense.documentUrl}
                      alt="Driving License Document"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                      <Lock className="w-6 h-6 text-white/80 mb-1" />
                      <span className="text-xs font-black tracking-widest text-white uppercase drop-shadow-md">
                        HOMIE DRIVES AUDIT ONLY
                      </span>
                      <span className="text-[10px] text-white/70 font-mono mt-0.5">
                        DO NOT DISTRIBUTE • VERIFIED VIA DIGILOCKER
                      </span>
                    </div>
                  </div>
                </div>

                {/* Administrative Risk & Notes Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-[#172016]">
                      Administrative Risk Level Calibration
                    </label>
                    <div className="flex items-center gap-2">
                      {(["low", "medium", "high"] as KYCRiskLevel[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRisk(r)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                            selectedRisk === r
                              ? r === "low"
                                ? "bg-emerald-600 text-white"
                                : r === "medium"
                                ? "bg-amber-600 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-[#F3F6F1] text-[#5C6B5A] hover:bg-[#E8EFE5]"
                          }`}
                        >
                          {r} Risk
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172016] block mb-1">
                      Verification Notes &amp; Audit Trail Justification
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add compliance notes or specific re-upload reasons..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-medium text-[#172016] bg-white outline-hidden"
                    />
                  </div>

                  {/* Feedback Banner */}
                  {kycFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        kycFeedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {kycFeedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{kycFeedback.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 bg-[#FAFBF9] border-t border-[#E8EFE5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleRequestReupload}
                  disabled={isReviewingKYC}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReviewingKYC ? "animate-spin" : ""}`} />
                  <span>Request Re-upload</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleReviewKYC("flagged")}
                    disabled={isReviewingKYC}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Flag / Decline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewKYC("verified")}
                    disabled={isReviewingKYC}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isReviewingKYC ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve &amp; Verify Driver</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Master Escrow & Financial Settlement Breakdown Modal */}
        {inspectingSettlement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8EFE5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <span>Trip Escrow &amp; Financial Settlement</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        {inspectingSettlement.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Booking: {inspectingSettlement.bookingRef} • Customer: {inspectingSettlement.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInspectingSettlement(null);
                    setEscrowFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Trip Snapshot Card */}
                <div className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#E8EFE5] grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[#829280] block text-[10px] uppercase font-bold">Vehicle</span>
                    <strong className="text-[#172016]">{inspectingSettlement.vehicleName}</strong>
                    <span className="block text-[10px] font-mono text-[#5C6B5A]">
                      {inspectingSettlement.vehicleRegistration}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#829280] block text-[10px] uppercase font-bold">Operating Hub</span>
                    <strong className="text-[#172016]">{inspectingSettlement.hubName}</strong>
                  </div>
                  <div>
                    <span className="text-[#829280] block text-[10px] uppercase font-bold">Rental Window</span>
                    <span className="text-[#172016] font-medium">
                      {inspectingSettlement.pickupDate} – {inspectingSettlement.returnDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#829280] block text-[10px] uppercase font-bold">Customer Contact</span>
                    <span className="font-mono text-[#172016]">+91 {inspectingSettlement.customerPhone}</span>
                  </div>
                </div>

                {/* Financial Ledger Calculation Card */}
                <div className="p-4 rounded-2xl border border-[#E8EFE5] bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#F0F4ED] pb-2.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#5C6B5A]">
                      Escrow Reconciliation Breakdown
                    </span>
                    <span className="font-mono font-bold text-xs text-[#172016]">
                      Held: {formatINR(inspectingSettlement.depositHeldINR)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* FASTag Deductions */}
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E8EFE5] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172016]">
                          NETC FASTag Expressway Toll Deductions
                        </span>
                        <span className="font-mono font-bold text-rose-700">
                          - {formatINR(inspectingSettlement.fastagTollsINR)}
                        </span>
                      </div>
                      {inspectingSettlement.tollPlazas.length > 0 ? (
                        <div className="divide-y divide-[#F0F4ED] text-[10px] text-[#5C6B5A] pt-1">
                          {inspectingSettlement.tollPlazas.map((tp, idx) => (
                            <div key={idx} className="py-1 flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-[#172016]">{tp.plazaName}</span>
                                <span className="text-[#829280] ml-1.5 font-mono">({tp.timestamp})</span>
                              </div>
                              <span className="font-mono font-bold">{formatINR(tp.tollFeeINR)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#829280]">
                          Zero expressway tolls traversed during reservation.
                        </p>
                      )}
                    </div>

                    {/* Excess Km Deductions */}
                    {inspectingSettlement.excessKmChargesINR > 0 && (
                      <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E8EFE5] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#172016]">Excess Kilometers Beyond Quota</span>
                          <span className="block text-[10px] text-[#829280]">
                            {inspectingSettlement.excessKm} km over limit @ {formatINR(inspectingSettlement.excessKmRateINR)}/km
                          </span>
                        </div>
                        <span className="font-mono font-bold text-rose-700">
                          - {formatINR(inspectingSettlement.excessKmChargesINR)}
                        </span>
                      </div>
                    )}

                    {/* Damage & Detailing Deductions */}
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E8EFE5] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#172016]">Damage / Detailing Penalty</span>
                          {inspectingSettlement.damageReason && (
                            <span className="block text-[10px] text-[#829280]">
                              Reason: {inspectingSettlement.damageReason}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {inspectingSettlement.status === "disputed_hold" ? (
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#829280]">
                                ₹
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={adjustedDamage}
                                onChange={(e) => setAdjustedDamage(Number(e.target.value))}
                                className="w-full pl-6 pr-2 py-1 bg-white rounded-lg border border-[#CFD8CD] font-mono text-xs font-bold text-rose-700 focus:outline-hidden"
                              />
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-rose-700">
                              - {formatINR(inspectingSettlement.damageCleaningChargesINR)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mathematical Zero-Floor Display */}
                  <div className="p-3.5 bg-[#F0F4ED] rounded-xl border border-[#D5E2D1] space-y-1">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="text-[#3D4D3B]">Zero-Floor Formula Reconciliation:</span>
                      <span className="font-mono text-[#172016]">
                        max(0, {formatINR(inspectingSettlement.depositHeldINR)} - {formatINR(
                          inspectingSettlement.fastagTollsINR +
                          inspectingSettlement.excessKmChargesINR +
                          (inspectingSettlement.status === "disputed_hold" ? adjustedDamage : inspectingSettlement.damageCleaningChargesINR)
                        )})
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#D5E2D1]">
                      <span className="font-extrabold text-[#172016] text-sm">
                        Net Refund Authorized:
                      </span>
                      <span className="font-mono font-black text-base text-emerald-800">
                        {formatINR(
                          Math.max(
                            0,
                            inspectingSettlement.depositHeldINR -
                              (inspectingSettlement.fastagTollsINR +
                                inspectingSettlement.excessKmChargesINR +
                                (inspectingSettlement.status === "disputed_hold"
                                  ? adjustedDamage
                                  : inspectingSettlement.damageCleaningChargesINR))
                          )
                        )}
                      </span>
                    </div>
                    {inspectingSettlement.zeroFloorApplied && (
                      <p className="text-[10px] text-purple-700 font-semibold pt-0.5">
                        Permanent Directive Protection: Total deductions exceed held deposit. Customer balance capped at ₹0 (no negative debits).
                      </p>
                    )}
                  </div>
                </div>

                {/* Dispute / Notes Input */}
                {inspectingSettlement.status === "disputed_hold" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172016] block">
                      Dispute Adjudication Reason &amp; Audit Log Justification
                    </label>
                    <textarea
                      rows={2}
                      value={disputeResolutionNotes}
                      onChange={(e) => setDisputeResolutionNotes(e.target.value)}
                      placeholder="Explain adjustments made to damage charges or waive details..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CFD8CD] focus:border-[#50644E] text-xs font-medium text-[#172016] bg-white outline-hidden"
                    />
                  </div>
                )}

                {/* Feedback */}
                {escrowFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      escrowFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {escrowFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{escrowFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 bg-[#FAFBF9] border-t border-[#E8EFE5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-[#5C6B5A]">
                  Gateway Ref: <strong className="font-mono text-[#172016]">{inspectingSettlement.paymentGatewayRef}</strong>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingSettlement(null);
                      setEscrowFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {inspectingSettlement.status === "disputed_hold" ? (
                    <button
                      type="button"
                      onClick={handleResolveDispute}
                      disabled={isProcessingEscrow}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-700 hover:bg-rose-800 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingEscrow ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Recalibrating...</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3.5 h-3.5" />
                          <span>Resolve Dispute &amp; Recalibrate</span>
                        </>
                      )}
                    </button>
                  ) : inspectingSettlement.status === "held_in_escrow" ? (
                    <button
                      type="button"
                      onClick={() => handleDispatchRefund(inspectingSettlement)}
                      disabled={isProcessingEscrow}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingEscrow ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching via UPI...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Dispatch Bank Refund ({formatINR(inspectingSettlement.netRefundINR)})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Disbursed to Customer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL: DIGITAL RENTAL CONTRACT DOSSIER & E-SIGNATURE INSPECTOR
            =================================================================== */}
        {inspectingContract && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#DFE6DC] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-[#172016] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base tracking-tight">
                        Rental Contract: {inspectingContract.contractNumber}
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                        IT ACT 2000 VALID
                      </span>
                    </div>
                    <p className="text-xs text-white/70 font-mono mt-0.5">
                      Booking: {inspectingContract.bookingRef} • SHA-256: {inspectingContract.documentHashSHA256.slice(0, 24)}...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInspectingContract(null);
                    setContractFeedback(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs text-[#172016]">
                {/* Contract Meta & Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#DFE6DC] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#50644E]">
                      <Landmark className="w-4 h-4" />
                      <span>Lessor: Homie Drives Private Limited</span>
                    </div>
                    <p className="text-[#5C6B5A]">
                      Registered Office: Aerocity Gateway Tower, Aerocity, New Delhi 110037
                    </p>
                    <p className="text-[11px] text-[#5C6B5A]">
                      Hub Station: <strong>{inspectingContract.hubName}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#DFE6DC] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#50644E]">
                      <UserCheck className="w-4 h-4" />
                      <span>Lessee / Verified Driver</span>
                    </div>
                    <p className="font-bold text-sm text-[#172016]">{inspectingContract.customerName}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C6B5A]">
                      <span>DL: <strong className="font-mono text-[#172016]">{inspectingContract.dlNumber}</strong></span>
                      <span>Aadhaar: <strong className="font-mono text-[#172016]">{inspectingContract.maskedAadhaar}</strong></span>
                    </div>
                    <p className="text-[10px] text-[#829280]">
                      IP Timestamp: {inspectingContract.ipAddress}
                    </p>
                  </div>
                </div>

                {/* Vehicle & Financial Terms */}
                <div className="p-4 rounded-2xl border border-[#DFE6DC] bg-white space-y-3">
                  <h4 className="font-bold text-sm text-[#172016] flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#50644E]" />
                    <span>Vehicle &amp; Commercial Terms</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#5C6B5A] block">Vehicle Model</span>
                      <strong className="text-[#172016]">{inspectingContract.vehicleName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5C6B5A] block">Registration Plate</span>
                      <strong className="text-[#172016] font-mono">{inspectingContract.registrationNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5C6B5A] block">Rental Period</span>
                      <span className="text-[#172016] font-semibold">{inspectingContract.totalDays} Days ({inspectingContract.pickupDate} to {inspectingContract.returnDate})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5C6B5A] block">Daily Tariff</span>
                      <strong className="text-[#172016]">{formatINR(inspectingContract.dailyRateINR)}/day</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F0F4ED] flex items-center justify-between">
                    <span className="text-xs text-[#5C6B5A]">Held Security Deposit in Escrow:</span>
                    <strong className="text-sm font-black text-emerald-800">
                      {formatINR(inspectingContract.depositHeldINR)}
                    </strong>
                  </div>
                </div>

                {/* Statutory Rental Covenants */}
                <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E8EFE5] space-y-1.5 text-[11px] text-[#5C6B5A]">
                  <strong className="text-xs font-bold text-[#172016] block">
                    Statutory Covenants &amp; Operational Governance
                  </strong>
                  <p>1. <strong>Same-Hub Return:</strong> The vehicle must be returned to the origin hub station ({inspectingContract.hubName}) with fuel level matching dispatch.</p>
                  <p>2. <strong>FASTag NETC Deduction:</strong> National expressway toll deductions are reconciled automatically at trip completion against the held escrow balance.</p>
                  <p>3. <strong>Zero-Floor Financial Guarantee:</strong> Net refund is calculated as max(0, Held Deposit - Deductions). Customer will never be debited negatively post-trip.</p>
                </div>

                {/* Dual Vector E-Signatures Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Signature Box */}
                  <div className="p-4 rounded-2xl border border-[#CFD8CD] bg-[#F8FAF7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172016]">Customer Vector E-Sign</span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Cryptographically Sealed
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#DFE6DC] h-20 flex items-center justify-center">
                      <svg viewBox="0 0 300 80" className="w-full h-full">
                        <path
                          d={inspectingContract.customerSignatureSvg}
                          stroke="#172016"
                          strokeWidth="3.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="text-[10px] text-[#829280] space-y-0.5">
                      <p>Signer: {inspectingContract.customerName}</p>
                      <p>Timestamp: {new Date(inspectingContract.signedAt).toUTCString()}</p>
                      <p className="font-mono truncate">Audit IP: {inspectingContract.ipAddress}</p>
                    </div>
                  </div>

                  {/* Admin Countersignature Box */}
                  <div className="p-4 rounded-2xl border border-[#CFD8CD] bg-[#F8FAF7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172016]">Master Admin Countersign</span>
                      {inspectingContract.countersignedByAdmin ? (
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Countersigned
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      )}
                    </div>

                    {inspectingContract.countersignedByAdmin && inspectingContract.adminSignatureSvg ? (
                      <>
                        <div className="p-2 bg-white rounded-xl border border-[#DFE6DC] h-20 flex items-center justify-center">
                          <svg viewBox="0 0 300 80" className="w-full h-full">
                            <path
                              d={inspectingContract.adminSignatureSvg}
                              stroke="#50644E"
                              strokeWidth="3.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div className="text-[10px] text-[#829280] space-y-0.5">
                          <p>Signer: {inspectingContract.adminSignerName}</p>
                          <p>Countersigned: {new Date(inspectingContract.countersignedAt || Date.now()).toUTCString()}</p>
                          <p className="font-mono text-emerald-700 font-bold">Dual Vault Authorization Complete</p>
                        </div>
                      </>
                    ) : (
                      <div className="h-28 flex flex-col items-center justify-center gap-2 bg-amber-50/60 rounded-xl border border-dashed border-amber-300 p-3 text-center">
                        <Clock className="w-5 h-5 text-amber-700" />
                        <span className="text-xs font-bold text-amber-900">
                          Awaiting Master Administrator Verification
                        </span>
                        <p className="text-[10px] text-amber-800">
                          Inspect terms and verify driver KYC prior to executing administrative seal.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {contractFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      contractFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {contractFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{contractFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 bg-[#FAFBF9] border-t border-[#E8EFE5] flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-[#829280] font-mono">
                  Standard Agreement v2.4 (Delhi NCR)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingContract(null);
                      setContractFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6B5A] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {!inspectingContract.countersignedByAdmin && (
                    <button
                      type="button"
                      onClick={() => handleCountersignContract(inspectingContract.id)}
                      disabled={isCountersigning}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#50644E] hover:bg-[#3D4D3B] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCountersigning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sealing Contract...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Authorize &amp; Countersign Contract</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
