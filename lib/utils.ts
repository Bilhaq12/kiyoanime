import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null) {
  if (!date) return "Unknown"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncateText(text: string | null, maxLength: number) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getAnimeStatusColor(status: string | null) {
  if (!status) return "bg-gray-500"

  switch (status.toLowerCase()) {
    case "ongoing":
      return "bg-green-500"
    case "completed":
      return "bg-blue-500"
    case "upcoming":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

