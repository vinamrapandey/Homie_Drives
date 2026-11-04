"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { AppNotification, NotificationChannel, NotificationType } from "@/types/notification";
import { INITIAL_NOTIFICATIONS } from "@/data/notifications";

export async function markNotificationAsReadAction(id: string): Promise<{ success: boolean }> {
  const notif = INITIAL_NOTIFICATIONS.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    notif.deliveryStatus = "read";
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false };
}

export async function markAllNotificationsAsReadAction(): Promise<{ success: boolean }> {
  INITIAL_NOTIFICATIONS.forEach((n) => {
    n.read = true;
    n.deliveryStatus = "read";
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export const dispatchNotificationSchema = z.object({
  channel: z.enum(["in_app", "sms", "whatsapp"]),
  type: z.enum([
    "kyc_verified",
    "contract_signed",
    "toll_debited",
    "deposit_refunded",
    "surge_alert",
    "booking_confirmed",
  ]),
  title: z.string().min(3, "Title required"),
  message: z.string().min(5, "Message content required"),
  recipient: z.string().min(3, "Recipient required"),
  recipientName: z.string().default("Customer"),
  href: z.string().optional(),
});

export type DispatchNotificationInput = z.infer<typeof dispatchNotificationSchema>;

export async function sendCustomerDispatchNotificationAction(
  input: DispatchNotificationInput
): Promise<{
  success: boolean;
  notification?: AppNotification;
  message?: string;
  error?: string;
}> {
  try {
    const validated = dispatchNotificationSchema.parse(input);
    const newNotif: AppNotification = {
      id: `notif-${Date.now().toString(36)}`,
      channel: validated.channel,
      type: validated.type,
      title: validated.title,
      message: validated.message,
      recipient: validated.recipient,
      recipientName: validated.recipientName,
      timestamp: "Just now",
      read: false,
      href: validated.href || "/admin",
      deliveryStatus: "delivered",
    };

    INITIAL_NOTIFICATIONS.unshift(newNotif);
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      notification: newNotif,
      message: `[${validated.channel.toUpperCase()}] Alert dispatched to ${validated.recipient} (${validated.recipientName}).`,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch notification",
    };
  }
}

