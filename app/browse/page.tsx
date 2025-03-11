import { Suspense } from "react"
import { getSupabase } from "@/lib/supabase"
import AnimeGrid from "@/components/anime-grid"
import FilterSidebar from "@/components/filter-sidebar"

type Props = {
  searchParams: {
    sort?: string
    status?: string
    type?: string
    genre?: string
    page?: string
  }
}

async function getGenres() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("genre").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }

  return data
}

async function getAnime(params: Props["searchParams"]) {
  const supabase = getSupabase()
  let query = supabase.from("anime").select("*")

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status)
    console.log(`Filtering by status: ${params.status}`)
  }

  if (params.type) {
    query = query.eq("type", params.type)
  }

  // Apply genre filter if provided
  if (params.genre) {
    // We need to join with anime_genre table to filter by genre
    query = query.select("*, anime_genre!inner(*)").eq("anime_genre.genre_id", params.genre)
  }

  // Apply sorting
  if (params.sort === "popular") {
    query = query.order("views", { ascending: false })
  } else if (params.sort === "rating") {
    query = query.order("rating", { ascending: false })
  } else if (params.sort === "newest") {
    query = query.order("release_date", { ascending: false })
  } else {
    query = query.order("title", { ascending: true })
  }

  // Apply pagination
  const page = params.page ? Number.parseInt(params.page) : 1
  const pageSize = 20
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  query = query.range(start, end)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching anime:", error)
    return []
  }

  console.log(`Found ${data.length} anime with params:`, params)
  return data
}

async function getAnimeCount(params: Props["searchParams"]) {
  const supabase = getSupabase()
  let query = supabase.from("anime").select("id", { count: "exact" })

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status)
  }

  if (params.type) {
    query = query.eq("type", params.type)
  }

  // Apply genre filter if provided
  if (params.genre) {
    // We need to join with anime_genre table to filter by genre
    query = query.select("id, anime_genre!inner(*)", { count: "exact" }).eq("anime_genre.genre_id", params.genre)
  }

  const { count, error } = await query

  if (error) {
    console.error("Error fetching anime count:", error)
    return 0
  }

  return count || 0
}

export default async function BrowsePage({ searchParams }: Props) {
  console.log("Browse page loaded with params:", searchParams)

  const genres = await getGenres()
  const anime = await getAnime(searchParams)
  const totalCount = await getAnimeCount(searchParams)

  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const pageSize = 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="pt-20 pb-10">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Browse Anime</h1>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <Suspense fallback={<div className="h-96 bg-secondary/20 animate-pulse rounded-lg" />}>
            <FilterSidebar genres={genres} currentFilters={searchParams} />
          </Suspense>

          <Suspense fallback={<div className="h-96 bg-secondary/20 animate-pulse rounded-lg" />}>
            <AnimeGrid anime={anime} currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}


