import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Anime - Kiyocomics",
  description: "Browse and discover anime by genre, status, and more",
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children
}

