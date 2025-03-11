export interface Anime {
    id: number;
    title: string;
    image_url: string;
    type: string;
    rating: number;
    status: string;
    views: number;
    last_update: string;
    description: string;
    release_date: string;
    anime_genre: AnimeGenre[];
    }
    
    export interface AnimeGenre {
    genre: Genre;
    }
    
    export interface Genre {
    name: string;
    }