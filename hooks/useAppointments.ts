"use client";

import { useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";
import { db } from "@/lib/firebase/client";
import type { AppointmentFormData, AvailableSlot } from "@/types/appointment";

const FORT_WORTH_TZ = "America/Chicago";

const WEEKDAY_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const SUNDAY_HOURS = [10, 11, 12, 13, 14, 15, 16];

/** Returns the current date string (YYYY-MM-DD) in Fort Worth local time */
function todayInFortWorth(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FORT_WORTH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Returns the current hour (0-23) and minute (0-59) in Fort Worth local time */
function nowInFortWorth(): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FORT_WORTH_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { hour, minute };
}

const MAX_BOOKINGS_PER_SLOT = 3;

function buildSlots(date: Date, bookingCounts: Record<string, number>): AvailableSlot[] {
  const isSunday = date.getDay() === 0;
  const allHours = isSunday ? SUNDAY_HOURS : WEEKDAY_HOURS;

  // Determine if selected date is today in Fort Worth time
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const isToday = dateStr === todayInFortWorth();

  const { hour: currentHour, minute: currentMinute } = isToday
    ? nowInFortWorth()
    : { hour: -1, minute: 0 };

  return allHours
    .filter((h) => {
      if (!isToday) return true;
      return h > currentHour || (h === currentHour && currentMinute === 0);
    })
    .map((h) => {
      const time = `${String(h).padStart(2, "0")}:00`;
      return {
        time,
        label: `${time} hs`,
        isBooked: (bookingCounts[time] ?? 0) >= MAX_BOOKINGS_PER_SLOT,
      };
    });
}

interface UseAppointmentsReturn {
  slots: AvailableSlot[];
  isLoadingSlots: boolean;
  fetchSlots: (date: Date) => Promise<void>;
  createAppointment: (
    data: AppointmentFormData,
    referrerId?: string,
    vehicleId?: string,
    vehicleName?: string,
  ) => Promise<void>;
}

export function useAppointments(): UseAppointmentsReturn {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const fetchSlots = useCallback(async (date: Date): Promise<void> => {
    setIsLoadingSlots(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const q = query(
        collection(db, "appointments"),
        where("date", "==", dateStr)
      );
      const snapshot = await getDocs(q);
      const bookingCounts: Record<string, number> = {};
      for (const doc of snapshot.docs) {
        const time = (doc.data() as { time: string }).time;
        bookingCounts[time] = (bookingCounts[time] ?? 0) + 1;
      }
      setSlots(buildSlots(date, bookingCounts));
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const createAppointment = useCallback(
    async (
      data: AppointmentFormData,
      referrerId = "",
      vehicleId?: string,
      vehicleName?: string,
    ): Promise<void> => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(data.date, "yyyy-MM-dd"),
          time: data.time,
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes ?? "",
          referrerId,
          vehicleId,
          vehicleName,
        }),
      });
      if (!res.ok) {
        throw new Error("Error al agendar el turno");
      }
    },
    []
  );

  return { slots, isLoadingSlots, fetchSlots, createAppointment };
}
