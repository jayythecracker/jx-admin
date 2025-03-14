import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsedDate)) return "Invalid date";
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsedDate)) return "Invalid date";
    return format(parsedDate, "yyyy-MM-dd HH:mm");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "Invalid date";
  }
}

export function getInitials(name: string): string {
  if (!name) return "U";
  
  const parts = name.split(" ").filter(part => part.length > 0);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Format phone number to be more readable
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  return phone;
}
