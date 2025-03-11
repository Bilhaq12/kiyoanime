export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      anime: {
        Row: {
          id: number
          title: string
          image_url: string | null
          type: string | null
          rating: number | null
          status: string | null
          views: number | null
          last_update: string | null
          description: string | null
          release_date: string | null
        }
        Insert: {
          id?: number
          title: string
          image_url?: string | null
          type?: string | null
          rating?: number | null
          status?: string | null
          views?: number | null
          last_update?: string | null
          description?: string | null
          release_date?: string | null
        }
        Update: {
          id?: number
          title?: string
          image_url?: string | null
          type?: string | null
          rating?: number | null
          status?: string | null
          views?: number | null
          last_update?: string | null
          description?: string | null
          release_date?: string | null
        }
      }
      anime_character: {
        Row: {
          anime_id: number
          character_id: number
        }
        Insert: {
          anime_id: number
          character_id: number
        }
        Update: {
          anime_id?: number
          character_id?: number
        }
      }
      anime_genre: {
        Row: {
          anime_id: number
          genre_id: number
        }
        Insert: {
          anime_id: number
          genre_id: number
        }
        Update: {
          anime_id?: number
          genre_id?: number
        }
      }
      anime_schedules: {
        Row: {
          id: number
          anime_id: number | null
          day: string | null
          time: string | null
        }
        Insert: {
          id?: number
          anime_id?: number | null
          day?: string | null
          time?: string | null
        }
        Update: {
          id?: number
          anime_id?: number | null
          day?: string | null
          time?: string | null
        }
      }
      author: {
        Row: {
          id: number
          name: string
          image_url: string | null
          biography: string | null
        }
        Insert: {
          id?: number
          name: string
          image_url?: string | null
          biography?: string | null
        }
        Update: {
          id?: number
          name?: string
          image_url?: string | null
          biography?: string | null
        }
      }
      chapter: {
        Row: {
          id: number
          manga_id: number | null
          chapter_number: number | null
          title: string | null
          release_date: string | null
          image_url: string | null
        }
        Insert: {
          id?: number
          manga_id?: number | null
          chapter_number?: number | null
          title?: string | null
          release_date?: string | null
          image_url?: string | null
        }
        Update: {
          id?: number
          manga_id?: number | null
          chapter_number?: number | null
          title?: string | null
          release_date?: string | null
          image_url?: string | null
        }
      }
      character: {
        Row: {
          id: number
          name: string
          image_url: string | null
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          image_url?: string | null
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          image_url?: string | null
          description?: string | null
        }
      }
      episode: {
        Row: {
          id: number
          anime_id: number | null
          episode_number: number | null
          title: string | null
          air_date: string | null
          video_url: string | null
          image_url: string | null
        }
        Insert: {
          id?: number
          anime_id?: number | null
          episode_number?: number | null
          title?: string | null
          air_date?: string | null
          video_url?: string | null
          image_url?: string | null
        }
        Update: {
          id?: number
          anime_id?: number | null
          episode_number?: number | null
          title?: string | null
          air_date?: string | null
          video_url?: string | null
          image_url?: string | null
        }
      }
      genre: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      manga: {
        Row: {
          id: number
          title: string
          image_url: string | null
          type: string | null
          rating: number | null
          status: string | null
          views: number | null
          last_update: string | null
          description: string | null
          release_date: string | null
        }
        Insert: {
          id?: number
          title: string
          image_url?: string | null
          type?: string | null
          rating?: number | null
          status?: string | null
          views?: number | null
          last_update?: string | null
          description?: string | null
          release_date?: string | null
        }
        Update: {
          id?: number
          title?: string
          image_url?: string | null
          type?: string | null
          rating?: number | null
          status?: string | null
          views?: number | null
          last_update?: string | null
          description?: string | null
          release_date?: string | null
        }
      }
      manga_author: {
        Row: {
          manga_id: number
          author_id: number
        }
        Insert: {
          manga_id: number
          author_id: number
        }
        Update: {
          manga_id?: number
          author_id?: number
        }
      }
      manga_character: {
        Row: {
          manga_id: number
          character_id: number
        }
        Insert: {
          manga_id: number
          character_id: number
        }
        Update: {
          manga_id?: number
          character_id?: number
        }
      }
      manga_genre: {
        Row: {
          manga_id: number
          genre_id: number
        }
        Insert: {
          manga_id: number
          genre_id: number
        }
        Update: {
          manga_id?: number
          genre_id?: number
        }
      }
      video_quality: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      video_server: {
        Row: {
          id: number
          episode_id: number
          quality_id: number
          server_name: string
          url: string
          is_default: boolean
          server_id: string | null
        }
        Insert: {
          id?: number
          episode_id: number
          quality_id: number
          server_name: string
          url: string
          is_default?: boolean
          server_id?: string | null
        }
        Update: {
          id?: number
          episode_id?: number
          quality_id?: number
          server_name?: string
          url?: string
          is_default?: boolean
          server_id?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
