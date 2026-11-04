export type NotificationChannel = "in_app" | "sms" | "whatsapp";

export type NotificationType =
  | "kyc_verified"
  | "contract_signed"
  | "toll_debited"
  | "deposit_refunded"
  | "surge_alert"
  | "booking_confirmed";

export type DeliveryStatus = "delivered" | "sent" | "read";

export interface AppNotification {
  id: string;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  recipientName: string;
  timestamp: string;
  read: boolean;
  href?: string;
  deliveryStatus: DeliveryStatus;
}

