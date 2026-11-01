import { useState, useEffect } from "react";
import { createClient } from "./client";
import { DELHI_NCR_LOCATIONS } from "@/data/locations";
import { DEMO_CARS } from "@/data/cars";
import { LocationHub } from "@/types/booking";
import { Car } from "@/types/car";

/**
 * Fetches operational Delhi NCR hubs from Supabase with fallback to local typed data
 */
export async function getHubLocations(): Promise<LocationHub[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return DELHI_NCR_LOCATIONS;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pickup_locations")
      .select("id, name, slug, address, is_active")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return DELHI_NCR_LOCATIONS;
    }

    return data.map((loc) => ({
      id: loc.slug,
      name: loc.name,
      area: loc.name.split("(")[0].trim(),
      city: "Delhi NCR",
      address: loc.address,
      isPopular: true,
    }));
  } catch {
    return DELHI_NCR_LOCATIONS;
  }
}

/**
 * Fetches fleet vehicles from Supabase with fallback to local typed data
 */
export async function getVehicles(): Promise<Car[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return DEMO_CARS;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("operational_status", "active");

    if (error || !data || data.length === 0) {
      return DEMO_CARS;
    }

    // Merge database state with detailed gallery assets
    return DEMO_CARS.map((localCar) => {
      const dbCar = data.find((c) => c.slug === localCar.slug);
      if (!dbCar) return localCar;

      return {
        ...localCar,
        dailyPriceINR: dbCar.base_daily_price_inr || localCar.dailyPriceINR,
      };
    });
  } catch {
    return DEMO_CARS;
  }
}

/**
 * React Hook to subscribe to vehicles with zero layout shift
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Car[]>(DEMO_CARS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getVehicles()
      .then((data) => {
        if (isMounted) {
          setVehicles(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { vehicles, loading };
}

/**
 * React Hook to subscribe to operational hubs with zero layout shift
 */
export function useHubLocations() {
  const [hubs, setHubs] = useState<LocationHub[]>(DELHI_NCR_LOCATIONS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getHubLocations()
      .then((data) => {
        if (isMounted) {
          setHubs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { hubs, loading };
}

