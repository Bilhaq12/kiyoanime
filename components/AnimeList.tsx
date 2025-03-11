'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/types/SupabaseClient';

interface Anime {
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
}

const AnimeList: React.FC = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimes = async () => {
      const { data, error } = await supabase
        .from<Anime>('anime')
        .select('*');

      if (error) {
        console.error('Error fetching animes:', error);
      } else {
        setAnimes(data || []);
      }
      setLoading(false);
    };

    fetchAnimes();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">Anime List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animes.map(anime => (
          <div className="bg-white shadow-md rounded-lg overflow-hidden" key={anime.id}>
            <img className="w-full h-48 object-cover" src={anime.image_url} alt={anime.title} />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{anime.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimeList;