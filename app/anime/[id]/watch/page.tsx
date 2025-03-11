import { notFound } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import VideoPlayer from "@/components/video-player"
import EpisodeList from "@/components/episode-list"
import AnimeInfo from "@/components/anime-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WatchPageProps {
  params: {
    id: string
  }
  searchParams: {
    ep?: string
    server?: string
    quality?: string
  }
}

async function getAnime(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("anime").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching anime:", error)
    return null
  }

  return data
}

async function getEpisodes(animeId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("episode")
    .select("*")
    .eq("anime_id", animeId)
    .order("episode_number", { ascending: true })

  if (error) {
    console.error("Error fetching episodes:", error)
    return []
  }

  return data
}

async function getVideoServers(episodeId: number) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("video_server")
    .select(`
      id,
      server_name,
      url,
      is_default,
      server_id,
      quality:quality_id(id, name)
    `)
    .eq("episode_id", episodeId)
    .order("is_default", { ascending: false })

  if (error) {
    console.error("Error fetching video servers:", error)
    return []
  }

  return data
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const anime = await getAnime(params.id)

  if (!anime) {
    notFound()
  }

  const episodes = await getEpisodes(params.id)
  const currentEpisodeNumber = searchParams.ep ? Number.parseInt(searchParams.ep) : 1

  const currentEpisode = episodes.find((ep) => ep.episode_number === currentEpisodeNumber) || episodes[0]

  if (!currentEpisode) {
    notFound()
  }

  // Find next and previous episodes
  const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisode.id)
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null

  // Get video servers for the current episode
  const videoServers = await getVideoServers(currentEpisode.id)

  // Handle server and quality from URL params
  const selectedServer = searchParams.server
  const selectedQuality = searchParams.quality

  return (
    <div className="pt-16 pb-8 min-h-screen bg-black">
      <div className="container mx-auto px-4">
        {/* Video Player */}
        <div className="mb-6">
          <VideoPlayer
            episode={currentEpisode}
            anime={anime}
            prevEpisode={prevEpisode}
            nextEpisode={nextEpisode}
            animeId={anime.id}
            videoServers={videoServers}
            initialServer={selectedServer}
            initialQuality={selectedQuality}
          />
        </div>

        {/* Episode Info */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{anime.title}</h1>
          <h2 className="text-lg text-gray-300 mb-4">
            Episode {currentEpisode.episode_number}
            {currentEpisode.title && <span className="text-gray-400"> - {currentEpisode.title}</span>}
          </h2>
        </div>

        {/* Tabs for Episodes and Info */}
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="info">Anime Info</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-0">
            <EpisodeList episodes={episodes} currentEpisodeId={currentEpisode.id} animeId={anime.id} />
          </TabsContent>

          <TabsContent value="info" className="mt-0">
            <AnimeInfo anime={anime} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

