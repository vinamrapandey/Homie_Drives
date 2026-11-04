import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Homie Drives — Self-Drive Rentals & Subscriptions",
    short_name: "Homie Drives",
    description:
      "Curated self-drive car rentals, multi-month flexible subscriptions, and keyless digital passes across Delhi NCR.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F6F1",
    theme_color: "#50644E",
    orientation: "portrait",
    icons: [
      {
        src: "/images/logo/homie_drives.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/logo/homie_drives.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/homie.drives.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "My Digital Passes",
        url: "/ride?tab=pass",
        description: "Access your active rental pass, pickup QR & smart key fob",
      },
      {
        name: "Plan a Road Trip",
        url: "/plan",
        description: "Explore Delhi NCR getaways, FASTag toll costs & hub stations",
      },
      {
        name: "DigiLocker Vault",
        url: "/profile?tab=vault",
        description: "Inspect verified MoRTH DL and UIDAI Aadhaar credentials",
      },
    ],
    categories: ["travel", "transportation", "lifestyle"],
  };
}
