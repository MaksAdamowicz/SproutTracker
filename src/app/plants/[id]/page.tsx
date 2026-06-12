'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Plant {
  id: string;
  name: string;
  species: string;
  date_planted: string;
  status: string;
  created_at: string;
}

interface GrowthLog {
  id: string;
  activity_type: string;
  measurement_cm: number | null;
  notes: string;
  image_url: string | null;
  created_at: string;
}

export default function PlantDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const fetchPlantAndLogs = async () => {
      if (resolvedParams?.id) {
        // Fetch plant
        const { data: plantData, error: plantError } = await supabase
          .from('plants')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (plantError) {
          setError('Failed to load plant.');
        } else if (plantData) {
          setPlant(plantData);
          setEditName(plantData.name);
          setEditSpecies(plantData.species || '');
          setEditStatus(plantData.status);
          
          // Fetch logs
          const { data: logsData } = await supabase
            .from('growth_logs')
            .select('*')
            .eq('plant_id', resolvedParams.id)
            .order('created_at', { ascending: false });
            
          if (logsData) {
            setLogs(logsData);
          }
        }
      }
      setLoading(false);
    };

    fetchPlantAndLogs();
  }, [resolvedParams]);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'water': return '💧';
      case 'fertilize': return '🧪';
      case 'measure': return '📏';
      case 'note': return '📝';
      default: return '📌';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading plant details...</div>;
  if (error || !plant) return <div className="p-8 text-center text-red-500">{error || 'Plant not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/plants" className="text-green-600 hover:text-green-500 font-medium text-sm flex items-center">
          &larr; Back to Garden
        </Link>
        <Link 
          href={`/plants/${plant.id}/log`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          + Log Activity
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-48 bg-green-200 dark:bg-green-900 flex items-center justify-center relative">
          <span className="text-6xl">🌿</span>
          <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm capitalize shadow-sm">
            {plant.status}
          </div>
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

              <div className="mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Date Planted</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {plant.date_planted ? new Date(plant.date_planted).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity History</h2>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No activity logged yet.</p>
          <Link href={`/plants/${plant.id}/log`} className="text-green-600 hover:text-green-500 font-medium">
            Log your first activity
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-5">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 text-2xl rounded-full">
                {getActivityIcon(log.activity_type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {log.activity_type}
                    {log.activity_type === 'measure' && log.measurement_cm && ` (${log.measurement_cm} cm)`}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{log.notes}</p>
                )}
                {log.image_url && (
                  <div className="mt-4 relative h-48 w-full sm:w-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image 
                      src={log.image_url} 
                      alt="Progress" 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
