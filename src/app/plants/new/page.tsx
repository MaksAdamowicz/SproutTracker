'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AddPlant() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [datePlanted, setDatePlanted] = useState('');
  const [status, setStatus] = useState('seedling');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError("You must be logged in to add a plant.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('plants')
      .insert([
        {
          user_id: session.user.id,
          name,
          species,
          date_planted: datePlanted || null,
          status,
        }
      ]);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/plants');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add a New Plant</h1>
        
        <form onSubmit={handleAddPlant} className="space-y-6">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Plant Name (Nickname)
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-900 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monster, Fernie"
            />
          </div>

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Species
            </label>
            <input
              type="text"
              id="species"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-900 dark:text-white"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa"
            />
          </div>

          <div>
            <label htmlFor="datePlanted" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Planted / Acquired
            </label>
            <input
              type="date"
              id="datePlanted"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-900 dark:text-white"
              value={datePlanted}
              onChange={(e) => setDatePlanted(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-900 dark:text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="seedling">Seedling</option>
              <option value="growing">Growing</option>
              <option value="blooming">Blooming</option>
              <option value="harvested">Harvested</option>
              <option value="dead">Dead</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
              {loading ? 'Adding...' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
