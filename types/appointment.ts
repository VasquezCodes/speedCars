import type { Timestamp } from "firebase/firestore";

export interface AppointmentFormData {
  date: Date;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface AvailableSlot {
  time: string;
  label: string;
  isBooked: boolean;
}

export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado" | "completado";

export interface AppointmentDocument {
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  referrerId: string;
  vehicleId?: string;
  vehicleName?: string;
  sellerName?: string | null;
  sellerEmail?: string | null;
  status?: AppointmentStatus;
  createdAt: Timestamp | string;
}

export interface AdminAppointment extends Omit<AppointmentDocument, "createdAt"> {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
}
