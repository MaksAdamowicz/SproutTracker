'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Plant {
  id: string;
  name: string;
  species: string;
  date_planted: string;
  status: string;
  created_at: string;
}

export default function PlantDetail() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const fetchPlant = async () => {
      if (params?.id) {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          setError('Failed to load plant.');
        } else if (data) {
          setPlant(data);
          setEditName(data.name);
          setEditSpecies(data.species || '');
          setEditStatus(data.status);
        }
      }
      setLoading(false);
    };

    fetchPlant();
  }, [params]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant) return;
    
    const { error } = await supabase
      .from('plants')
      .update({
        name: editName,
        species: editSpecies,
        status: editStatus
      })
      .eq('id', plant.id);

    if (!error) {
      setPlant({ ...plant, name: editName, species: editSpecies, status: editStatus });
      setIsEditing(false);
    } else {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!plant) return;
    if (confirm('Are you sure you want to delete this plant?')) {
      const { error } = await supabase.from('plants').delete().eq('id', plant.id);
      if (!error) {
        router.push('/plants');
      } else {
        alert('Failed to delete plant');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading plant details...</div>;
  if (error || !plant) return <div className="p-8 text-center text-red-500">{error || 'Plant not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/plants" className="text-green-600 hover:text-green-500 font-medium text-sm">
          &larr; Back to Garden
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="h-48 bg-green-200 dark:bg-green-900 flex items-center justify-center">
          <span className="text-6xl">🌿</span>
        </div>
        
        <div className="p-6 sm:p-8">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Species</label>
                <input
                  type="text"
                  value={editSpecies}
                  onChange={e => setEditSpecies(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 dark:bg-gray-900 dark:text-white"
                >
                  <option value="seedling">Seedling</option>
                  <option value="growing">Growing</option>
                  <option value="blooming">Blooming</option>
                  <option value="harvested">Harvested</option>
                  <option value="dead">Dead</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-md font-medium">Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{plant.name}</h1>
                  <p className="text-lg text-gray-500 dark:text-gray-400">{plant.species || 'Unknown species'}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500">
                    <span className="sr-only">Edit</span>
                    ✏️ Edit
                  </button>
                  <button onClick={handleDelete} className="text-red-500 hover:text-red-700 ml-4">
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white capitalize">{plant.status}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date Planted</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {plant.date_planted ? new Date(plant.date_planted).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
