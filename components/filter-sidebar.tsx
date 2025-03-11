"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Tables } from "@/types/supabase"

interface FilterSidebarProps {
  genres: Tables<"genre">[]
  currentFilters: {
    sort?: string
    status?: string
    type?: string
    genre?: string
  }
}

export default function FilterSidebar({ genres, currentFilters }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [openSections, setOpenSections] = useState({
    sort: true,
    status: true,
    type: true,
    genres: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Pastikan fungsi applyFilter berjalan dengan benar
  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams()

    // Add all current filters
    Object.entries(currentFilters).forEach(([k, v]) => {
      if (v && k !== key) {
        params.append(k, v)
      }
    })

    // Add or update the new filter
    if (value) {
      params.append(key, value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "title", label: "A-Z" },
  ]

  // Ubah bagian statusOptions untuk memastikan nilai status sesuai dengan yang digunakan di URL
  const statusOptions = [
    { value: "Ongoing", label: "Ongoing" },
    { value: "Completed", label: "Completed" },
    { value: "Upcoming", label: "Upcoming" },
  ]

  const typeOptions = [
    { value: "TV", label: "TV Series" },
    { value: "Movie", label: "Movie" },
    { value: "OVA", label: "OVA" },
    { value: "Special", label: "Special" },
  ]

  return (
    <div className="bg-secondary/20 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Sort By */}
      <Collapsible open={openSections.sort} onOpenChange={() => toggleSection("sort")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="font-medium">Sort By</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.sort ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                currentFilters.sort === option.value ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              }`}
              onClick={() => applyFilter("sort", option.value)}
            >
              {option.label}
              {currentFilters.sort === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Status */}
      <Collapsible open={openSections.status} onOpenChange={() => toggleSection("status")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="font-medium">Status</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.status ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                currentFilters.status === option.value ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              }`}
              onClick={() => applyFilter("status", option.value)}
            >
              {option.label}
              {currentFilters.status === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Type */}
      <Collapsible open={openSections.type} onOpenChange={() => toggleSection("type")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="font-medium">Type</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.type ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                currentFilters.type === option.value ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              }`}
              onClick={() => applyFilter("type", option.value)}
            >
              {option.label}
              {currentFilters.type === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Genres */}
      <Collapsible open={openSections.genres} onOpenChange={() => toggleSection("genres")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="font-medium">Genres</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.genres ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2 max-h-60 overflow-y-auto">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                currentFilters.genre === genre.id.toString() ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              }`}
              onClick={() => applyFilter("genre", genre.id.toString())}
            >
              {genre.name}
              {currentFilters.genre === genre.id.toString() && <Check className="h-4 w-4" />}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

