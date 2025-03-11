import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Tables } from "@/types/supabase"
import AnimeCard from "@/components/anime-card"
import { Button } from "@/components/ui/button"

interface AnimeGridProps {
  anime: Tables<"anime">[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export default function AnimeGrid({ anime, currentPage, totalPages, searchParams }: AnimeGridProps) {
  // Create pagination links with current search params
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()

    // Add all current search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.append(key, value)
      }
    })

    // Add the page param
    params.append("page", page.toString())

    return `/browse?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {anime.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {anime.map((item) => (
              <div key={item.id} className="w-full h-full">
                <AnimeCard anime={item} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button variant="outline" size="icon" disabled={currentPage <= 1} asChild={currentPage > 1}>
                {currentPage > 1 ? (
                  <Link href={createPageUrl(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
              >
                {currentPage < totalPages ? (
                  <Link href={createPageUrl(currentPage + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium mb-2">No anime found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria</p>
          <Button asChild>
            <Link href="/browse">Clear Filters</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

