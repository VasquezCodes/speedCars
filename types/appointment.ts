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
  createdAt: Timestamp;
}
