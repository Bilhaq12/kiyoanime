import Image from "next/image"
import Link from "next/link"
import { Calendar, Star, Eye, Clock, Info } from "lucide-react"
import type { Tables } from "@/types/supabase"
import { Badge } from "@/components/ui/badge"
import { formatDate, getAnimeStatusColor } from "@/lib/utils"

interface AnimeInfoProps {
  anime: Tables<"anime">
}

export default function AnimeInfo({ anime }: AnimeInfoProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 flex-shrink-0">
          <div className="rounded-lg overflow-hidden">
            {anime.image_url ? (
              <Image
                src={anime.image_url || "/placeholder.svg"}
                alt={anime.title}
                width={192}
                height={288}
                className="object-cover w-full aspect-[2/3]"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {anime.status && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Status: </span>
                <Badge className={`${getAnimeStatusColor(anime.status)} text-white ml-auto`}>{anime.status}</Badge>
              </div>
            )}

            {anime.release_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Released: </span>
                <span className="text-sm text-gray-300 ml-auto">{formatDate(anime.release_date)}</span>
              </div>
            )}

            {anime.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-300">Rating: </span>
                <span className="text-sm text-gray-300 ml-auto">{anime.rating.toFixed(1)}/10</span>
              </div>
            )}

            {anime.views && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Views: </span>
                <span className="text-sm text-gray-300 ml-auto">{anime.views.toLocaleString()}</span>
              </div>
            )}

            {anime.type && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Type: </span>
                <span className="text-sm text-gray-300 ml-auto">{anime.type}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-4">Synopsis</h2>
          {anime.description ? (
            <p className="text-gray-300 text-sm">{anime.description}</p>
          ) : (
            <p className="text-gray-400 text-sm">No description available.</p>
          )}

          <div className="mt-6">
            <Link href={`/anime/${anime.id}`} className="text-primary hover:text-primary/80 text-sm font-medium">
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

