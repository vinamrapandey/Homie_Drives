import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DEMO_CARS } from "@/data/cars";
import { CarDetailView } from "@/components/cars/CarDetailView";

interface CarPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEMO_CARS.map((car) => ({
    slug: car.slug,
  }));
}

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = DEMO_CARS.find((c) => c.slug === slug);

  if (!car) {
    return {
      title: "Car Not Found | Homie Drives",
    };
  }

  return {
    title: `${car.name} — Homie Drives Delhi NCR`,
    description: `Rent the ${car.name} in Delhi NCR. ${car.categoryLabel} from ₹${car.dailyPriceINR.toLocaleString("en-IN")}/day with comprehensive insurance and same pickup/return hub.`,
  };
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { slug } = await params;
  const car = DEMO_CARS.find((c) => c.slug === slug);

  if (!car) {
    notFound();
  }

  return <CarDetailView car={car} showBackLink={true} />;
}
