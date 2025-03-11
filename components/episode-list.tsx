import Link from "next/link"
import Image from "next/image"
import type { Tables } from "@/types/supabase"
import { formatDate } from "@/lib/utils"

interface EpisodeListProps {
  episodes: Tables<"episode">[]
  currentEpisodeId: number
  animeId: number
}

export default function EpisodeList({ episodes, currentEpisodeId, animeId }: EpisodeListProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-white">Episodes ({episodes.length})</h2>
      </div>

      <div className="h-[calc(100vh-350px)] overflow-y-auto">
        {episodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/${animeId}/watch?ep=${episode.episode_number}`}
            className={`flex p-3 gap-3 hover:bg-gray-800/50 transition-colors ${
              episode.id === currentEpisodeId ? "bg-gray-800/80" : ""
            }`}
          >
            <div className="relative w-24 aspect-video rounded overflow-hidden flex-shrink-0">
              {episode.image_url ? (
                <Image
                  src={episode.image_url || "/placeholder.svg"}
                  alt={`Episode ${episode.episode_number}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No Preview</span>
                </div>
              )}

              {episode.id === currentEpisodeId && (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <div className="bg-primary text-white text-xs px-2 py-0.5 rounded">Playing</div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white">Episode {episode.episode_number}</p>
              {episode.title && <p className="text-xs text-gray-400 truncate">{episode.title}</p>}
              {episode.air_date && <p className="text-xs text-gray-500 mt-1">{formatDate(episode.air_date)}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

