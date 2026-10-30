/**
 * Format number into Indian Rupee (INR) currency string
 * e.g., 12000 => "₹12,000", 2499 => "₹2,499"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Indian number without currency symbol
 * e.g., 12000 => "12,000"
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format date in clean readable Indian format (e.g., "12 Nov 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate number of days between two dates (minimum 1 day)
 */
export function calculateRentalDays(pickupDate: string, returnDate: string): number {
  if (!pickupDate || !returnDate) return 1;
  const start = new Date(pickupDate).getTime();
  const end = new Date(returnDate).getTime();
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Calculate rental price breakdown for demo purposes
 */
export function calculateRentalPrice(dailyRate: number, days: number = 1) {
  const rentalBase = dailyRate * days;
  const insurance = 0; // Comprehensive insurance included in Homie Drives
  const serviceFee = Math.round(rentalBase * 0.05); // 5% platform fee
  const gst = Math.round(rentalBase * 0.18); // 18% GST in India
  const securityDeposit = dailyRate > 10000 ? 15000 : 5000; // Refundable deposit
  const total = rentalBase + serviceFee + gst;

  return {
    dailyRate,
    days,
    rentalBase,
    insurance,
    serviceFee,
    gst,
    securityDeposit,
    total,
  };
}
