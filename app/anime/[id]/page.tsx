import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Play, Calendar, Star, Eye, Clock, Info } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, getAnimeStatusColor } from "@/lib/utils"
import AnimeCarousel from "@/components/anime-carousel"

interface AnimePageProps {
  params: {
    id: string
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

async function getGenres(animeId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("anime_genre").select("genre_id, genre(id, name)").eq("anime_id", animeId)

  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }

  return data.map((item) => item.genre)
}

async function getCharacters(animeId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("anime_character")
    .select("character_id, character(id, name, image_url, description)")
    .eq("anime_id", animeId)
    .limit(6)

  if (error) {
    console.error("Error fetching characters:", error)
    return []
  }

  return data.map((item) => item.character)
}

async function getSimilarAnime(animeId: string) {
  const supabase = getSupabase()
  // In a real app, you'd use genre matching or other recommendation logic
  // For now, we'll just get random anime
  const { data, error } = await supabase.from("anime").select("*").neq("id", animeId).limit(10)

  if (error) {
    console.error("Error fetching similar anime:", error)
    return []
  }

  return data
}

export default async function AnimePage({ params }: AnimePageProps) {
  const anime = await getAnime(params.id)

  if (!anime) {
    notFound()
  }

  const episodes = await getEpisodes(params.id)
  const genres = await getGenres(params.id)
  const characters = await getCharacters(params.id)
  const similarAnime = await getSimilarAnime(params.id)

  // Update view count
  if (anime) {
    const supabase = getSupabase()
    await supabase
      .from("anime")
      .update({ views: (anime.views || 0) + 1 })
      .eq("id", anime.id)
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        {anime.image_url ? (
          <Image src={anime.image_url || "/placeholder.svg"} alt={anime.title} fill priority className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-black to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 hero-gradient" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Anime Poster */}
          <div className="hidden md:block">
            <div className="rounded-lg overflow-hidden border-4 border-background shadow-xl">
              {anime.image_url ? (
                <Image
                  src={anime.image_url || "/placeholder.svg"}
                  alt={anime.title}
                  width={250}
                  height={375}
                  className="object-cover w-full aspect-[2/3]"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full gap-2" asChild>
                <Link href={`/anime/${anime.id}/watch`}>
                  <Play className="h-4 w-4" />
                  Watch Now
                </Link>
              </Button>

              {anime.status && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Status: </span>
                  <Badge className={`${getAnimeStatusColor(anime.status)} text-white ml-auto`}>{anime.status}</Badge>
                </div>
              )}

              {anime.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Released: </span>
                  <span className="text-sm ml-auto">{formatDate(anime.release_date)}</span>
                </div>
              )}

              {anime.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Rating: </span>
                  <span className="text-sm ml-auto">{anime.rating.toFixed(1)}/10</span>
                </div>
              )}

              {anime.views && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Views: </span>
                  <span className="text-sm ml-auto">{anime.views.toLocaleString()}</span>
                </div>
              )}

              {anime.type && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Type: </span>
                  <span className="text-sm ml-auto">{anime.type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Anime Details */}
          <div className="bg-background/80 backdrop-blur-md rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{anime.title}</h1>

            {/* Mobile Buttons */}
            <div className="md:hidden flex gap-4 mb-4">
              <Button className="flex-1 gap-2" asChild>
                <Link href={`/anime/${anime.id}/watch`}>
                  <Play className="h-4 w-4" />
                  Watch
                </Link>
              </Button>

              {anime.status && (
                <Badge className={`${getAnimeStatusColor(anime.status)} text-white`}>{anime.status}</Badge>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {anime.description && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                <p className="text-sm text-muted-foreground">{anime.description}</p>
              </div>
            )}

            {/* Characters */}
            {characters.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Characters</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {characters.map((character: any) => (
                    <div key={character.id} className="text-center">
                      <div className="relative w-full aspect-square rounded-full overflow-hidden mb-2 mx-auto border-2 border-primary/20">
                        {character.image_url ? (
                          <Image
                            src={character.image_url || "/placeholder.svg"}
                            alt={character.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium line-clamp-1">{character.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Episodes</h2>

              {episodes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={`/anime/${anime.id}/watch?ep=${episode.episode_number}`}
                      className="group"
                    >
                      <div className="relative aspect-video rounded-md overflow-hidden bg-secondary">
                        {episode.image_url ? (
                          <Image
                            src={episode.image_url || "/placeholder.svg"}
                            alt={`Episode ${episode.episode_number}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No Preview</span>
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                          <Play className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="mt-1">
                        <p className="text-xs font-medium">Episode {episode.episode_number}</p>
                        {episode.title && <p className="text-xs text-muted-foreground truncate">{episode.title}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No episodes available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Anime */}
        {similarAnime.length > 0 && (
          <div className="mt-12 pb-8">
            <AnimeCarousel title="You May Also Like" animeList={similarAnime} />
          </div>
        )}
      </div>
    </div>
  )
}

