import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { DEMO_CARS } from "@/data/cars";
import HubPageView from "@/components/hubs/HubPageView";

interface HubPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DELHI_NCR_LOCATIONS.map((hub) => ({
    slug: hub.slug,
  }));
}

export async function generateMetadata({ params }: HubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = DELHI_NCR_LOCATIONS.find((h) => h.slug === slug || h.id === slug);

  if (!hub) {
    return {
      title: "Hub Not Found • Homie Drives",
    };
  }

  return {
    title: `${hub.name} • ${hub.city} Fleet Station | Homie Drives`,
    description: `Explore available self-drive and luxury car rental fleet stationed at Homie Drives ${hub.name} (${hub.area}). Instant pickup, sanitized vehicles, 24x7 concierge dispatch.`,
  };
}

export default async function HubPage({ params }: HubPageProps) {
  const { slug } = await params;
  const hub = DELHI_NCR_LOCATIONS.find((h) => h.slug === slug || h.id === slug);

  if (!hub) {
    notFound();
  }

  // Filter cars stationed at this hub
  const stationCars = DEMO_CARS.filter(
    (car) =>
      car.hubSlug === hub.slug ||
      car.hubLocation.toLowerCase().includes(hub.name.toLowerCase()) ||
      car.hubLocation.toLowerCase().includes(hub.city.toLowerCase())
  );

  return <HubPageView hub={hub} cars={stationCars} />;
}

