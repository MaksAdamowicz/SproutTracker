'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Plant {
  id: string;
  name: string;
  species: string;
  status: string;
}

export default function MyGarden() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPlants(data);
        }
      }
      setLoading(false);
    };

    fetchPlants();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading garden...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Garden</h1>
        <Link 
          href="/plants/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + Add Plant
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Your garden is empty.</p>
          <Link 
            href="/plants/new"
            className="text-green-600 hover:text-green-500 font-medium"
          >
            Start growing today!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plants.map(plant => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-32 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🌱</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plant.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{plant.species}</p>
                <div className="mt-4 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize">
                  {plant.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
