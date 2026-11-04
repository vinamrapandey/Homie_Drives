"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LocationHub } from "@/types/booking";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Radio,
} from "lucide-react";

interface GoogleRegionalMapProps {
  selectedHubId?: string;
  onSelectHub?: (hub: LocationHub) => void;
  height?: string;
  showCorridors?: boolean;
  className?: string;
}

// Expressway route paths across Delhi NCR for visual corridor mapping
const EXPRESSWAY_CORRIDORS = [
  {
    id: "yamuna",
    name: "Yamuna Expressway (Taj Corridor to Agra)",
    code: "YE-01",
    color: "#50644E",
    distance: "210 km • 3 hrs",
    toll: "₹435",
    path: [
      { lat: 28.5708, lng: 77.3271 }, // Noida
      { lat: 28.4732, lng: 77.5097 }, // Greater Noida / Pari Chowk
      { lat: 28.1500, lng: 77.6000 }, // Jewar
      { lat: 27.5000, lng: 77.7000 }, // Mathura
      { lat: 27.1767, lng: 78.0081 }, // Agra
    ],
  },
  {
    id: "ne4",
    name: "Delhi–Mumbai Greenfield Expressway (NE-4 to Jaipur)",
    code: "NE-4",
    color: "#B45309",
    distance: "280 km • 4 hrs 15 mins",
    toll: "₹585",
    path: [
      { lat: 28.4947, lng: 77.0894 }, // Gurugram
      { lat: 28.3500, lng: 77.0500 }, // Sohna
      { lat: 27.8000, lng: 76.9000 }, // Ferozepur Jhirka
      { lat: 26.9124, lng: 75.7873 }, // Jaipur
    ],
  },
  {
    id: "ne3",
    name: "Delhi–Meerut Expressway (NE-3 to Rishikesh / Dehradun)",
    code: "NE-3",
    color: "#2563EB",
    distance: "96 km • 1 hr 15 mins",
    toll: "₹70",
    path: [
      { lat: 28.6139, lng: 77.2090 }, // Central Delhi
      { lat: 28.6836, lng: 77.4445 }, // Ghaziabad
      { lat: 28.7500, lng: 77.5500 }, // Dasna
      { lat: 28.9845, lng: 77.7064 }, // Meerut
    ],
  },
];

export const GoogleRegionalMap: React.FC<GoogleRegionalMapProps> = ({
  selectedHubId,
  onSelectHub,
  height = "h-[480px] sm:h-[540px]",
  showCorridors = true,
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeHub, setActiveHub] = useState<LocationHub>(() => {
    return (
      DELHI_NCR_LOCATIONS.find((h) => h.id === selectedHubId || h.slug === selectedHubId) ||
      DELHI_NCR_LOCATIONS[0]
    );
  });
  const [activeCorridorId, setActiveCorridorId] = useState<string>("all");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [mapEngine, setMapEngine] = useState<"google" | "interactive_vector">("interactive_vector");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

  // Synchronize incoming selectedHubId
  useEffect(() => {
    if (selectedHubId) {
      const match = DELHI_NCR_LOCATIONS.find(
        (h) => h.id === selectedHubId || h.slug === selectedHubId
      );
      if (match) setActiveHub(match);
    }
  }, [selectedHubId]);

  // Attempt Google Maps JS SDK initialization when API key is present
  useEffect(() => {
    if (!apiKey) {
      setMapEngine("interactive_vector");
      return;
    }

    let isMounted = true;

    const loadGoogleMaps = async () => {
      try {
        if (!window.google || !window.google.maps) {
          const scriptId = "google-maps-script";
          let existingScript = document.getElementById(scriptId) as HTMLScriptElement;

          if (!existingScript) {
            existingScript = document.createElement("script");
            existingScript.id = scriptId;
            existingScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            existingScript.async = true;
            existingScript.defer = true;
            document.head.appendChild(existingScript);
          }

          await new Promise<void>((resolve, reject) => {
            existingScript.onload = () => resolve();
            existingScript.onerror = () => reject(new Error("Failed to load Google Maps SDK"));
          });
        }

        if (isMounted && window.google?.maps && mapContainerRef.current) {
          setIsGoogleMapsLoaded(true);
          setMapEngine("google");

          const centerLat = activeHub.latitude ?? 28.5355;
          const centerLng = activeHub.longitude ?? 77.3910;

          // Custom Homie Drives Soft Sage Palette for Google Maps
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#d2ded0" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f4f7f2" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }],
              },
              {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#e8efe5" }],
              },
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#3d4d3b" }],
              },
            ],
          });

          // Add markers for all Delhi NCR Hubs
          DELHI_NCR_LOCATIONS.forEach((hub) => {
            const hLat = hub.latitude ?? 28.5355;
            const hLng = hub.longitude ?? 77.3910;
            const isSelected = hub.id === activeHub.id;

            const marker = new window.google.maps.Marker({
              position: { lat: hLat, lng: hLng },
              map,
              title: hub.name,
              icon: {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: isSelected ? "#172016" : "#50644E",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                scale: isSelected ? 1.8 : 1.4,
                anchor: new window.google.maps.Point(12, 22),
              },
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 6px; font-family: sans-serif; max-width: 200px;">
                  <strong style="color: #172016; font-size: 13px;">${hub.name}</strong>
                  <p style="color: #5C6B5A; font-size: 11px; margin: 3px 0;">${hub.area}</p>
                  <p style="color: #50644E; font-weight: bold; font-size: 11px;">24x7 Express Handover</p>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
              setActiveHub(hub);
              if (onSelectHub) onSelectHub(hub);
            });
          });

          // Add expressway corridors if requested
          if (showCorridors) {
            EXPRESSWAY_CORRIDORS.forEach((corridor) => {
              new window.google.maps.Polyline({
                path: corridor.path,
                geodesic: true,
                strokeColor: corridor.color,
                strokeOpacity: 0.75,
                strokeWeight: 4,
                map,
              });
            });
          }
        }
      } catch {
        // Fallback gracefully on any API key error or network restriction
        setMapEngine("interactive_vector");
      }
    };

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [apiKey, activeHub.id, showCorridors, onSelectHub]);

  const handleSelectHubInternal = (hub: LocationHub) => {
    setActiveHub(hub);
    if (onSelectHub) onSelectHub(hub);
  };

  const activeLat = activeHub.latitude ?? 28.5355;
  const activeLng = activeHub.longitude ?? 77.3910;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeLat},${activeLng}`;

  return (
    <div
      className={`relative w-full rounded-3xl border border-[#E1E8DF] bg-white shadow-homie overflow-hidden ${className}`}
    >
      {/* Top Map Control Bar */}
      <div className="p-4 sm:p-5 border-b border-[#F0F4ED] bg-white/95 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#EAF0E7] flex items-center justify-center text-[#50644E] shadow-2xs">
            <Compass className="w-5 h-5 text-[#50644E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#172016]">
                Delhi NCR Operating Hubs &amp; Expressway Corridors
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0E7] text-[#50644E] border border-[#D5E2D1]">
                6 Handover Stations
              </span>
            </div>
            <p className="text-xs text-[#5C6B5A]">
              Real-world station coordinates across Delhi, Gurugram, Noida, Faridabad, and Meerut.
            </p>
          </div>
        </div>

        {/* Engine Status & Telematics Invariant Pill */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F6F1] border border-[#DFE6DC] text-[11px] font-semibold text-[#5C6B5A]">
            <Radio className="w-3 h-3 text-[#50644E]" />
            <span>
              {mapEngine === "google" && isGoogleMapsLoaded
                ? "Google Maps API: Live"
                : "Interactive Regional Vector Engine"}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-[#5C6B5A] text-[10px] font-bold border border-stone-200"
            title="Permanent Telematics Directive: Live vehicle GPS is only displayed when physical OBD-II hardware is paired."
          >
            <Shield className="w-3 h-3 text-[#829280]" />
            <span>GPS NOT CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Corridor Quick Filters */}
      {showCorridors && (
        <div className="px-4 py-2.5 bg-[#FAFBF9] border-b border-[#F0F4ED] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#829280] shrink-0">
            Corridors:
          </span>
          <button
            type="button"
            onClick={() => setActiveCorridorId("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCorridorId === "all"
                ? "bg-[#50644E] text-white shadow-2xs"
                : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
            }`}
          >
            All NCR Hubs
          </button>
          {EXPRESSWAY_CORRIDORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCorridorId(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCorridorId === c.id
                  ? "bg-[#172016] text-white shadow-2xs"
                  : "bg-white text-[#5C6B5A] hover:bg-[#F0F4ED] border border-[#E8EFE5]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span>{c.code}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">({c.toll} toll)</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Map View Area */}
      <div className={`relative w-full ${height} bg-[#F3F6F1] overflow-hidden`}>
        {/* Google Maps SDK Container (Activated when valid key provided) */}
        {apiKey && (
          <div
            ref={mapContainerRef}
            className={`w-full h-full ${
              mapEngine === "google" && isGoogleMapsLoaded ? "block" : "hidden"
            }`}
          />
        )}

        {/* Interactive Regional Vector Map (Instant zero-config fallback) */}
        {(!apiKey || mapEngine === "interactive_vector") && (
          <div className="relative w-full h-full bg-[#EBF0E9] flex flex-col justify-between overflow-hidden select-none">
            {/* Ambient Regional Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#50644E_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

            {/* Simulated Geographic Landmass Lines for NCR */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="corridorGradYamuna" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#50644E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3D4D3B" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="corridorGradNE4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B45309" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#78350F" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Yamuna River Curve Representation */}
              <path
                d="M 280 0 Q 340 160 380 260 T 520 480"
                fill="none"
                stroke="#C6D7C2"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Expressway Highway Corridors */}
              {/* Yamuna Expressway Corridor */}
              <path
                d="M 370 230 L 580 480"
                fill="none"
                stroke="#50644E"
                strokeWidth={activeCorridorId === "yamuna" || activeCorridorId === "all" ? "4" : "1.5"}
                strokeDasharray={activeCorridorId === "yamuna" ? "none" : "6 4"}
                opacity={activeCorridorId === "yamuna" || activeCorridorId === "all" ? 0.9 : 0.3}
              />

              {/* Delhi-Mumbai Expressway Corridor */}
              <path
                d="M 300 240 L 120 480"
                fill="none"
                stroke="#B45309"
                strokeWidth={activeCorridorId === "ne4" || activeCorridorId === "all" ? "4" : "1.5"}
                strokeDasharray={activeCorridorId === "ne4" ? "none" : "6 4"}
                opacity={activeCorridorId === "ne4" || activeCorridorId === "all" ? 0.9 : 0.3}
              />

              {/* Delhi-Meerut Expressway Corridor */}
              <path
                d="M 320 200 L 480 70"
                fill="none"
                stroke="#2563EB"
                strokeWidth={activeCorridorId === "ne3" || activeCorridorId === "all" ? "4" : "1.5"}
                strokeDasharray={activeCorridorId === "ne3" ? "none" : "6 4"}
                opacity={activeCorridorId === "ne3" || activeCorridorId === "all" ? 0.9 : 0.3}
              />
            </svg>

            {/* Interactive Hub Markers Positioned by NCR Coordinate Scale */}
            {/* Bounding Box: Lat 28.35 -> 29.05, Lng 77.00 -> 77.75 */}
            <div className="absolute inset-0 p-8 sm:p-12">
              {DELHI_NCR_LOCATIONS.map((hub) => {
                const isSelected = hub.id === activeHub.id;
                const lat = hub.latitude ?? 28.5355;
                const lng = hub.longitude ?? 77.3910;

                // Project Lat/Lng to approximate percentage position within NCR container
                const minLat = 28.32;
                const maxLat = 29.02;
                const minLng = 76.98;
                const maxLng = 77.78;

                const topPercent = Math.max(10, Math.min(88, ((maxLat - lat) / (maxLat - minLat)) * 100));
                const leftPercent = Math.max(10, Math.min(88, ((lng - minLng) / (maxLng - minLng)) * 100));

                return (
                  <div
                    key={hub.id}
                    onClick={() => handleSelectHubInternal(hub)}
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute cursor-pointer group z-20"
                  >
                    {/* Pulsing ring for active selection */}
                    {isSelected && (
                      <span className="absolute -inset-2.5 rounded-full bg-[#50644E]/30 animate-ping pointer-events-none" />
                    )}

                    {/* Marker Pin */}
                    <div
                      className={`relative flex items-center justify-center rounded-2xl shadow-lg transition-all duration-200 group-hover:scale-110 ${
                        isSelected
                          ? "w-11 h-11 bg-[#172016] text-white ring-4 ring-white"
                          : "w-9 h-9 bg-[#50644E] text-white hover:bg-[#3D4D3B]"
                      }`}
                    >
                      <MapPin className={`${isSelected ? "w-5 h-5 text-emerald-400" : "w-4 h-4 text-white"}`} />
                    </div>

                    {/* Badge Label */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                        isSelected
                          ? "bg-[#172016] text-white scale-105"
                          : "bg-white/95 text-[#172016] border border-[#E1E8DF] group-hover:bg-[#172016] group-hover:text-white"
                      }`}
                    >
                      <span>{hub.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Watermark Notice */}
            <div className="absolute bottom-3 left-4 z-10 pointer-events-none">
              <span className="text-[10px] text-[#5C6B5A]/80 font-mono bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E1E8DF]">
                Delhi NCR Geographic Projection • WGS84 Datum
              </span>
            </div>
          </div>
        )}

        {/* Floating Selected Hub Detail Card (Glass Card) */}
        <div className="absolute bottom-4 right-4 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-[#E1E8DF] shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#50644E] bg-[#EAF0E7] px-2 py-0.5 rounded-full border border-[#D5E2D1]">
                {activeHub.city} Fleet Station
              </span>
              <h4 className="font-extrabold text-sm text-[#172016] mt-1">
                {activeHub.name}
              </h4>
              <p className="text-xs text-[#5C6B5A] mt-0.5 line-clamp-1">
                {activeHub.area}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl overflow-hidden relative shrink-0 border border-[#E1E8DF]">
              <Image
                src={activeHub.image || "/images/cars/homie_thar_roxx.jpg"}
                alt={activeHub.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-[#F0F4ED]">
            <div className="flex items-start gap-1.5 text-[#5C6B5A]">
              <MapPin className="w-3.5 h-3.5 text-[#50644E] shrink-0 mt-0.5" />
              <span className="text-[11px] leading-snug line-clamp-2">{activeHub.address}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#5C6B5A] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#829280]" />
                24x7 Express Handover
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-[#829280]" />
                {activeHub.phone || "8448786016"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-[#50644E] hover:bg-[#3D4D3B] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
            <a
              href={`tel:+91${activeHub.phone || "8448786016"}`}
              className="p-2 rounded-xl bg-[#F3F6F1] hover:bg-[#EAF0E7] text-[#50644E] border border-[#DFE6DC] transition-all cursor-pointer"
              title="Call Station Desk"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
