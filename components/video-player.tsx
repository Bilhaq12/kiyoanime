"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  Settings,
  Forward,
  Rewind,
  PictureInPicture,
  ExternalLink,
  Server,
  Check,
} from "lucide-react"
import type { Tables } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VideoServer {
  id: number
  server_name: string
  url: string
  is_default: boolean
  server_id: string | null
  quality: {
    id: number
    name: string
  }
}

interface VideoPlayerProps {
  episode: Tables<"episode">
  anime: Tables<"anime">
  prevEpisode: Tables<"episode"> | null
  nextEpisode: Tables<"episode"> | null
  animeId: number
  videoServers: VideoServer[]
  initialServer?: string
  initialQuality?: string
}

export default function VideoPlayer({
  episode,
  anime,
  prevEpisode,
  nextEpisode,
  animeId,
  videoServers = [],
  initialServer,
  initialQuality,
}: VideoPlayerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferedTime, setBufferedTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Server and quality state
  const [currentServer, setCurrentServer] = useState<VideoServer | null>(null)
  const [availableQualities, setAvailableQualities] = useState<{ id: number; name: string }[]>([])
  const [availableServers, setAvailableServers] = useState<{ id: string; name: string }[]>([])
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null)
  const [selectedServer, setSelectedServer] = useState<string | null>(null)

  // Initialize servers and qualities
  useEffect(() => {
    if (videoServers.length > 0) {
      // Extract unique qualities
      const qualities = Array.from(new Set(videoServers.map((server) => JSON.stringify(server.quality)))).map(
        (quality) => JSON.parse(quality) as { id: number; name: string },
      )
      setAvailableQualities(qualities)

      // Extract unique servers
      const servers = Array.from(new Set(videoServers.map((server) => server.server_id || server.server_name))).map(
        (serverId) => {
          const server = videoServers.find((s) => (s.server_id || s.server_name) === serverId)
          return {
            id: serverId,
            name: server?.server_name || serverId,
          }
        },
      )
      setAvailableServers(servers)

      // Find initial server based on URL params or default
      let initialServerObj: VideoServer | undefined

      if (initialServer) {
        initialServerObj = videoServers.find(
          (s) =>
            (s.server_id || s.server_name) === initialServer &&
            (initialQuality ? s.quality.id.toString() === initialQuality : true),
        )
      }

      if (!initialServerObj && initialQuality) {
        initialServerObj = videoServers.find((s) => s.quality.id.toString() === initialQuality)
      }

      if (!initialServerObj) {
        initialServerObj = videoServers.find((s) => s.is_default) || videoServers[0]
      }

      if (initialServerObj) {
        setCurrentServer(initialServerObj)
        setSelectedQuality(initialServerObj.quality.id)
        setSelectedServer(initialServerObj.server_id || initialServerObj.server_name)
      }
    } else if (episode.video_url) {
      // Fallback to episode.video_url if no servers are available
      setCurrentServer({
        id: 0,
        server_name: "Default",
        url: episode.video_url,
        is_default: true,
        server_id: null,
        quality: { id: 0, name: "Auto" },
      })

      // Add default quality and server for legacy support
      setAvailableQualities([{ id: 0, name: "Auto" }])
      setAvailableServers([{ id: "default", name: "Default" }])
      setSelectedQuality(0)
      setSelectedServer("default")
    }
  }, [videoServers, episode.video_url, initialServer, initialQuality])

  // Change server
  const changeServer = (serverId: string) => {
    // Find all servers with this server ID
    const serversWithId = videoServers.filter((s) => (s.server_id || s.server_name) === serverId)

    if (serversWithId.length === 0) {
      return
    }

    // If we have a selected quality, try to find a server with that quality
    let newServer: VideoServer | undefined

    if (selectedQuality !== null) {
      newServer = serversWithId.find((s) => s.quality.id === selectedQuality)
    }

    // If no server found with selected quality, use the first one
    if (!newServer) {
      newServer = serversWithId[0]
    }

    if (newServer) {
      // Update URL parameters
      const params = new URLSearchParams(searchParams.toString())
      params.set("server", serverId)
      params.set("quality", newServer.quality.id.toString())

      // Update state
      setCurrentServer(newServer)
      setSelectedServer(serverId)
      setSelectedQuality(newServer.quality.id)
      setIsLoading(true)
      setVideoError(false)

      // Update URL without refreshing the page
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  // Change quality
  const changeQuality = (qualityId: number) => {
    // Find all servers with this quality ID
    const serversWithQuality = videoServers.filter((s) => s.quality.id === qualityId)

    if (serversWithQuality.length === 0) {
      return
    }

    // If we have a selected server, try to find a quality for that server
    let newServer: VideoServer | undefined

    if (selectedServer !== null) {
      newServer = serversWithQuality.find((s) => (s.server_id || s.server_name) === selectedServer)
    }

    // If no server found with selected server, use the first one
    if (!newServer) {
      newServer = serversWithQuality[0]
    }

    if (newServer) {
      // Save current time to resume at the same position
      const currentTimePosition = videoRef.current?.currentTime || 0

      // Update URL parameters
      const params = new URLSearchParams(searchParams.toString())
      params.set("quality", qualityId.toString())
      params.set("server", newServer.server_id || newServer.server_name)

      // Update state
      setCurrentServer(newServer)
      setSelectedQuality(qualityId)
      setSelectedServer(newServer.server_id || newServer.server_name)
      setIsLoading(true)
      setVideoError(false)

      // Update URL without refreshing the page
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      // Resume playback at the same position after changing quality
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTimePosition
          if (isPlaying) videoRef.current.play()
        }
      }, 500)
    }
  }

  // Process video URL to optimize embedding
  const processVideoUrl = (url: string): string => {
    if (!url) return ""

    // Handle Mega links
    if (url.includes("mega.nz")) {
      // Convert to embed URL if it's not already
      if (!url.includes("/embed")) {
        // Extract file ID
        const fileId = url.split("!")[1]?.split("#")[0]
        if (fileId) {
          return `https://mega.nz/embed/${fileId}`
        }
      }
    }

    // Handle Pixeldrain links
    if (url.includes("pixeldrain.com")) {
      // Convert to embed/direct video URL
      const match = url.match(/\/u\/([a-zA-Z0-9]+)/)
      if (match && match[1]) {
        return `https://pixeldrain.com/api/file/${match[1]}`
      }
    }

    // Handle Blogger links
    if (url.includes("blogger.com") || url.includes("blogspot.com")) {
      // Try to extract the direct video URL if possible
      return url
    }

    // Handle Acefile links
    if (url.includes("acefile.co")) {
      // If it's already an embed URL, return as is
      if (url.includes("/embed/")) {
        return url
      }
      // Try to convert to embed URL
      const match = url.match(/\/([a-zA-Z0-9]+)\/([a-zA-Z0-9-]+)/)
      if (match && match[1] && match[2]) {
        return `https://acefile.co/player/${match[1]}/${match[2]}`
      }
    }

    // Return original URL if no special handling needed
    return url
  }

  // Determine video type
  const rawVideoUrl = currentServer?.url || episode.video_url || ""
  const videoUrl = processVideoUrl(rawVideoUrl)
  const isDirectVideo = videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm") || videoUrl.endsWith(".ogg")
  const isIframeVideo = !isDirectVideo && videoUrl.length > 0

  useEffect(() => {
    if (!isDirectVideo) return

    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Update buffered time
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      setVideoError(true)
      setIsLoading(false)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("volumechange", handleVolumeChange)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.addEventListener("error", handleError)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("volumechange", handleVolumeChange)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("error", handleError)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [isDirectVideo])

  // Handle iframe loading
  useEffect(() => {
    if (!isIframeVideo) return

    const handleIframeLoad = () => {
      setIsLoading(false)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad)

      return () => {
        iframe.removeEventListener("load", handleIframeLoad)
      }
    }
  }, [isIframeVideo])

  // Update video source when currentServer changes
  useEffect(() => {
    if (currentServer) {
      setIsLoading(true)
      setVideoError(false)

      // For direct video, we need to reload the video element
      if (isDirectVideo && videoRef.current) {
        const currentTime = videoRef.current.currentTime
        const wasPlaying = !videoRef.current.paused

        // Force reload by setting the src attribute directly
        videoRef.current.src = videoUrl

        videoRef.current.load()

        // Restore playback state after loading
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.currentTime = currentTime
          if (wasPlaying) {
            videoRef.current!.play().catch((err) => {
              setVideoError(true)
            })
          }
        }
      }
    }
  }, [currentServer, isDirectVideo, videoUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    video.muted = !video.muted
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    const newVolume = value[0]
    video.volume = newVolume
    if (newVolume === 0) {
      video.muted = true
    } else if (video.muted) {
      video.muted = false
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    video.currentTime = value[0]
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const togglePictureInPicture = async () => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch (error) {
      console.error("Picture-in-Picture failed:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && isDirectVideo) {
        setShowControls(false)
      }
    }, 3000)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    video.currentTime = Math.min(video.currentTime + 10, video.duration)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    video.currentTime = Math.max(video.currentTime - 10, 0)
  }

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current
    if (!video || !isDirectVideo) return

    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const handleRetry = () => {
    setVideoError(false)
    setIsLoading(true)

    const video = videoRef.current
    if (video) {
      video.load()
      video.play().catch(() => {
        setVideoError(true)
        setIsLoading(false)
      })
    }
  }

  const openInNewTab = () => {
    if (currentServer?.url) {
      window.open(currentServer.url, "_blank", "noopener,noreferrer")
    } else if (episode.video_url) {
      window.open(episode.video_url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-2">
      {/* Server and Quality Selection - Moved to top for better visibility */}
      <div className="bg-gray-900 rounded-lg p-3 flex flex-wrap justify-between items-center gap-2">
        <div className="text-white text-sm md:text-base font-medium truncate">
          {anime.title} - Episode {episode.episode_number}
          {episode.title && `: ${episode.title}`}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Server Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Server className="h-4 w-4" />
                <span className="text-xs">{currentServer?.server_name || "Server"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Server</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableServers.map((server) => (
                <DropdownMenuItem
                  key={server.id}
                  onClick={() => changeServer(server.id)}
                  className="flex justify-between items-center"
                >
                  {server.name}
                  {selectedServer === server.id && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quality Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="h-4 w-4" />
                <span className="text-xs">
                  {selectedQuality !== null
                    ? availableQualities.find((q) => q.id === selectedQuality)?.name || "Quality"
                    : "Quality"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Quality</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableQualities.map((quality) => (
                <DropdownMenuItem
                  key={quality.id}
                  onClick={() => changeQuality(quality.id)}
                  className="flex justify-between items-center"
                >
                  {quality.name}
                  {selectedQuality === quality.id && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Current Server/Quality Badge */}
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {currentServer?.server_name || "Default"} • {currentServer?.quality?.name || "Auto"}
          </Badge>
        </div>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden aspect-video max-h-[calc(100vh-250px)]"
        onMouseMove={handleMouseMove}
      >
        {/* Direct Video Player */}
        {isDirectVideo && (
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={episode.image_url || anime.image_url || undefined}
            onClick={togglePlay}
            playsInline
            controls={false}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Iframe Video Player */}
        {isIframeVideo && (
          <div className="w-full h-full aspect-video">
            <iframe
              ref={iframeRef}
              src={videoUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`${anime.title} - Episode ${episode.episode_number}`}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        )}

        {/* No Video URL */}
        {!videoUrl && (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center p-6">
              <h3 className="text-xl font-bold mb-2">Video Tidak Tersedia</h3>
              <p className="text-gray-400 mb-4">Video untuk episode ini belum tersedia.</p>
            </div>
          </div>
        )}

        {/* Video Error */}
        {videoError && isDirectVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center p-6 max-w-md">
              <h3 className="text-xl font-bold mb-2">Video Tidak Dapat Diputar</h3>
              <p className="text-gray-400 mb-4">Video tidak dapat diputar karena masalah teknis.</p>
              <div className="flex justify-center gap-3">
                <Button onClick={handleRetry} variant="secondary">
                  Coba Lagi
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Buka di Player Eksternal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Play/Pause Overlay for Direct Video */}
        {!isPlaying && !isLoading && isDirectVideo && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40" onClick={togglePlay}>
            <div className="rounded-full bg-primary/80 p-4">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Double Tap Overlay for Direct Video */}
        {isDirectVideo && !videoError && (
          <>
            <div className="absolute inset-y-0 left-0 w-1/3" onDoubleClick={skipBackward}></div>
            <div className="absolute inset-y-0 right-0 w-1/3" onDoubleClick={skipForward}></div>
          </>
        )}
      </div>

      {/* Video Controls Below Video */}
      <div className="bg-gray-900 rounded-lg p-3 shadow-lg">
        {/* Direct Video Controls */}
        {isDirectVideo && !videoError && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-white text-xs">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                {/* Buffered Progress */}
                <div
                  className="absolute h-full bg-gray-500"
                  style={{ width: `${(bufferedTime / duration) * 100}%` }}
                ></div>
                {/* Playback Progress */}
                <div
                  className="absolute h-full bg-primary"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.01}
                  value={currentTime}
                  onChange={(e) => handleSeek([Number.parseFloat(e.target.value)])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-white text-xs">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={skipBackward}
                  aria-label="Skip backward 10 seconds"
                >
                  <Rewind className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={skipForward}
                  aria-label="Skip forward 10 seconds"
                >
                  <Forward className="h-5 w-5" />
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  {showVolumeSlider && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/80 rounded-md w-32"
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hidden sm:flex">
                      <span className="text-xs">{playbackSpeed}x</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className="flex justify-between items-center"
                      >
                        {speed}x{playbackSpeed === speed && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Picture in Picture */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hidden sm:flex"
                  onClick={togglePictureInPicture}
                  aria-label="Picture in picture"
                >
                  <PictureInPicture className="h-5 w-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe Video Controls - Simplified */}
        {isIframeVideo && !isLoading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Episode Navigation */}
              {prevEpisode && (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={`/anime/${animeId}/watch?ep=${prevEpisode.episode_number}`}>
                    <SkipBack className="h-4 w-4" />
                    <span className="text-xs">Previous Episode</span>
                  </a>
                </Button>
              )}

              {nextEpisode && (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={`/anime/${animeId}/watch?ep=${nextEpisode.episode_number}`}>
                    <span className="text-xs">Next Episode</span>
                    <SkipForward className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Fullscreen</span>
              </Button>

              <Button variant="outline" size="sm" className="gap-1" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">External Player</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Episode Navigation Buttons - Below Controls */}
      <div className="flex gap-4 mt-4">
        {prevEpisode && (
          <a
            href={`/anime/${animeId}/watch?ep=${prevEpisode.episode_number}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors flex-1 text-center"
          >
            ← Previous Episode
          </a>
        )}

        {nextEpisode && (
          <a
            href={`/anime/${animeId}/watch?ep=${nextEpisode.episode_number}`}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-md text-sm transition-colors flex-1 text-center"
          >
            Next Episode →
          </a>
        )}
      </div>
    </div>
  )
}

