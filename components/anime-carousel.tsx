"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tables } from "@/types/supabase"
import AnimeCard from "@/components/anime-card"

interface AnimeCarouselProps {
  title: string
  animeList: Tables<"anime">[]
  viewAllHref?: string
}

export default function AnimeCarousel({ title, animeList, viewAllHref }: AnimeCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollButtons = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollButtons()
    window.addEventListener("resize", checkScrollButtons)
    return () => window.removeEventListener("resize", checkScrollButtons)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const scrollAmount = carouselRef.current.clientWidth * 0.75
    const newScrollLeft =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount

    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })

    setTimeout(checkScrollButtons, 400)
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllHref && (
          <Button variant="link" className="text-primary" asChild>
            <a href={viewAllHref}>View All</a>
          </Button>
        )}
      </div>

      <div className="relative group">
        {/* Left Navigation Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-24 w-12 flex items-center justify-center
                     bg-gradient-to-r from-background/80 to-transparent backdrop-blur-sm
                     transition-all duration-300 opacity-0 group-hover:opacity-100
                     hover:from-primary/20 hover:to-transparent"
            aria-label="Scroll left"
          >
            <div
              className="relative w-8 h-8 flex items-center justify-center
                          bg-primary/10 rounded-full
                          transition-transform duration-300 transform group-hover:scale-110
                          hover:bg-primary/20 hover:scale-125"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10" />
            </div>
          </button>
        )}

        {/* Right Navigation Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-24 w-12 flex items-center justify-center
                     bg-gradient-to-l from-background/80 to-transparent backdrop-blur-sm
                     transition-all duration-300 opacity-0 group-hover:opacity-100
                     hover:from-primary/20 hover:to-transparent"
            aria-label="Scroll right"
          >
            <div
              className="relative w-8 h-8 flex items-center justify-center
                          bg-primary/10 rounded-full
                          transition-transform duration-300 transform group-hover:scale-110
                          hover:bg-primary/20 hover:scale-125"
            >
              <ChevronRight className="h-5 w-5 text-white" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10" />
            </div>
          </button>
        )}

        {/* Carousel Content */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 pb-2 scroll-smooth"
          onScroll={checkScrollButtons}
        >
          {animeList.map((anime) => (
            <div
              key={anime.id}
              className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px]"
            >
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

