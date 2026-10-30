import { LocationHub } from "@/types/booking";

export const DELHI_NCR_LOCATIONS: LocationHub[] = [
  {
    id: "delhi-aerocity",
    name: "Aerocity Hub (IGI Airport)",
    area: "Aerocity / T3 Airport",
    city: "New Delhi",
    address: "Hospitality District, Near T3 Terminal, Aerocity, New Delhi 110037",
    isPopular: true,
  },
  {
    id: "delhi-cp",
    name: "Connaught Place Hub",
    area: "Central Delhi",
    city: "New Delhi",
    address: "Inner Circle, Block C, Connaught Place, New Delhi 110001",
    isPopular: true,
  },
  {
    id: "gurugram-cyberhub",
    name: "Cyber Hub DLF Phase 2",
    area: "Cyber City",
    city: "Gurugram",
    address: "Building 8, DLF Cyber City, DLF Phase 2, Gurugram 122002",
    isPopular: true,
  },
  {
    id: "gurugram-golfcourse",
    name: "Golf Course Road Hub",
    area: "Sector 54",
    city: "Gurugram",
    address: "Horizon Centre, Golf Course Road, Sector 54, Gurugram 122002",
    isPopular: false,
  },
  {
    id: "noida-sec18",
    name: "Sector 18 Hub",
    area: "Atta Market / Mall Mile",
    city: "Noida",
    address: "Sector 18 Commercial Complex, Noida, Uttar Pradesh 201301",
    isPopular: true,
  },
  {
    id: "delhi-saket",
    name: "Select Citywalk Hub",
    area: "Saket District Centre",
    city: "New Delhi",
    address: "Press Enclave Marg, Saket District Centre, New Delhi 110017",
    isPopular: false,
  },
];

export const DEFAULT_LOCATION = DELHI_NCR_LOCATIONS[0];
