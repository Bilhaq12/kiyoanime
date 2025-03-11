import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import type { Tables } from "@/types/supabase"
import { getAnimeStatusColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AnimeCardProps {
  anime: Tables<"anime">
  priority?: boolean
}

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`} className="group/card block w-full">
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-secondary/20">
        {anime.image_url ? (
          <Image
            src={anime.image_url || "/placeholder.svg"}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <div className="rounded-full bg-primary/80 p-3">
            <Play className="h-6 w-6" />
          </div>
        </div>

        {anime.status && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className={`${getAnimeStatusColor(anime.status)} text-white`}>
              {anime.status}
            </Badge>
          </div>
        )}

        {anime.rating && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-yellow-500 text-black font-medium">
              ★ {anime.rating.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="font-medium line-clamp-1 group-hover/card:text-primary transition-colors">{anime.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {anime.type || "TV"} • {anime.views?.toLocaleString() || 0} views
        </p>
      </div>
    </Link>
  )
}

