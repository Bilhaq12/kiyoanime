import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tables } from "@/types/supabase"
import { truncateText } from "@/lib/utils"

interface HeroSectionProps {
  anime: Tables<"anime">
}

export default function HeroSection({ anime }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      {anime.image_url ? (
        <Image src={anime.image_url || "/placeholder.svg"} alt={anime.title} fill priority className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-black to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground text-xl">No Image Available</span>
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 container mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
              #1 on Trend
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3">{anime.title}</h1>

          <p className="text-sm md:text-base text-gray-300 mb-6">{truncateText(anime.description || "", 200)}</p>

          <div className="flex flex-wrap gap-4">
            <Button asChild className="gap-2">
              <Link href={`/anime/${anime.id}/watch`}>
                <Play className="h-5 w-5" />
                Play Now
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/anime/${anime.id}`}>More Info</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

