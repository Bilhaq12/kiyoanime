import { Suspense } from "react"
import { getSupabase } from "@/lib/supabase"
import HeroSection from "@/components/hero-section"
import AnimeCarousel from "@/components/anime-carousel"
import type { Tables } from "@/types/supabase"

async function getFeaturedAnime() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .order("views", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching featured anime:", error)
    return null
  }

  return data
}

async function getPopularAnime() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("anime").select("*").order("views", { ascending: false }).limit(10)

  if (error) {
    console.error("Error fetching popular anime:", error)
    return []
  }

  return data
}

async function getRecentlyUpdated() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("anime").select("*").order("last_update", { ascending: false }).limit(10)

  if (error) {
    console.error("Error fetching recently updated anime:", error)
    return []
  }

  return data
}

async function getTopRated() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("anime").select("*").order("rating", { ascending: false }).limit(10)

  if (error) {
    console.error("Error fetching top rated anime:", error)
    return []
  }

  return data
}

// Tambahkan dua fungsi baru untuk mengambil anime ongoing dan completed
async function getOngoingAnime() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("status", "Ongoing")
    .order("last_update", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching ongoing anime:", error)
    return []
  }

  return data
}

async function getCompletedAnime() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("status", "Completed")
    .order("rating", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching completed anime:", error)
    return []
  }

  return data
}

// Function home
export default async function Home() {
  const featuredAnime = await getFeaturedAnime()
  const popularAnime = await getPopularAnime()
  const recentlyUpdated = await getRecentlyUpdated()
  const topRated = await getTopRated()
  const ongoingAnime = await getOngoingAnime()
  const completedAnime = await getCompletedAnime()

  // Fallback featured anime if none exists
  const defaultFeaturedAnime: Tables<"anime"> = {
    id: 0,
    title: "Solo Leveling Season 2",
    image_url:
      "https://sjc.microlink.io/ik9AWtGiod1D1w4rJBr2lX60y2Ile7hnBNym8PnSBevC77wJ3gaku6-RQmQazFQfZXuxUDqCzHGOwh5NomOD2A.jpeg",
    type: "TV",
    rating: 9.5,
    status: "Ongoing",
    views: 1000000,
    last_update: new Date().toISOString(),
    description:
      "The second season of Solo Leveling. Mastering his new abilities in secret, Jin-U must battle humanity's toughest foes to save his mother.",
    release_date: "2023-01-01",
  }

  return (
    <div className="pt-8">
      {" "}
      {/* Mengurangi padding dari pt-14 menjadi pt-8 */}
      <Suspense fallback={<div className="h-[70vh] bg-secondary animate-pulse" />}>
        <HeroSection anime={featuredAnime || defaultFeaturedAnime} />
      </Suspense>
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Pastikan URL untuk "View All" menggunakan case yang sama dengan filter sidebar */}
        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />}>
          <AnimeCarousel title="POPULAR THIS SEASON" animeList={popularAnime} viewAllHref="/browse?sort=popular" />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />}>
          <AnimeCarousel title="TOP AIRING" animeList={recentlyUpdated} viewAllHref="/browse?status=Ongoing" />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />}>
          <AnimeCarousel title="TOP RATED" animeList={topRated} viewAllHref="/browse?sort=rating" />
        </Suspense>

        {/* Pastikan URL untuk Ongoing Anime menggunakan case yang benar */}
        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />}>
          <AnimeCarousel title="ONGOING ANIME" animeList={ongoingAnime} viewAllHref="/browse?status=Ongoing" />
        </Suspense>

        {/* Pastikan URL untuk Completed Anime menggunakan case yang benar */}
        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />}>
          <AnimeCarousel title="COMPLETED ANIME" animeList={completedAnime} viewAllHref="/browse?status=Completed" />
        </Suspense>
      </div>
    </div>
  )
}

