'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface FeedLog {
  log_id: string;
  activity_type: string;
  measurement_cm: number | null;
  notes: string;
  image_url: string | null;
  created_at: string;
  plant_id: string;
  plant_name: string;
  plant_species: string;
  user_id: string;
  username: string;
  user_avatar: string | null;
  leaves_count: number;
  viewer_has_leafed: boolean;
}

export default function Feed() {
  const [logs, setLogs] = useState<FeedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchFeed(session.user.id, 0);
      } else {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  const fetchFeed = async (userId: string, pageNum: number) => {
    try {
      const { data, error } = await supabase
        .rpc('get_feed_logs', {
          viewer_id: userId,
          p_limit: PAGE_SIZE,
          p_offset: pageNum * PAGE_SIZE
        });

      if (error) throw error;

      if (data) {
        if (pageNum === 0) {
          setLogs(data);
        } else {
          setLogs(prev => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!session || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(session.user.id, nextPage);
  };

  const handleToggleLeaf = async (logId: string, currentlyLeafed: boolean) => {
    if (!session) return;
    
    // Optimistic update
    setLogs(prevLogs => prevLogs.map(log => {
      if (log.log_id === logId) {
        return {
          ...log,
          viewer_has_leafed: !currentlyLeafed,
          leaves_count: currentlyLeafed ? log.leaves_count - 1 : log.leaves_count + 1
        };
      }
      return log;
    }));

    if (currentlyLeafed) {
      await supabase
        .from('leaves')
        .delete()
        .eq('log_id', logId)
        .eq('user_id', session.user.id);
    } else {
      await supabase
        .from('leaves')
        .insert([{
          log_id: logId,
          user_id: session.user.id
        }]);
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

  if (loading) return <div className="p-8 text-center">Loading feed...</div>;

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to SproutTracker</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Join the community of plant lovers. Track your plants, log your activities, and share your growth journey with friends.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/login" className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity Feed</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {logs.length === 0 && !error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-4xl mb-4 block">🌱</span>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Your feed is quiet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Follow some friends to see their plant updates here, or log an activity for your own plants!
          </p>
          <Link href="/plants" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors inline-block">
            Go to My Garden
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.log_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link href={`/profile/${log.user_id}`}>
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {log.user_avatar ? (
                        <img src={log.user_avatar} alt={log.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 font-bold">{log.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link href={`/profile/${log.user_id}`} className="font-bold text-gray-900 dark:text-white hover:underline">
                      {log.username}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 text-xl rounded-full">
                    {getActivityIcon(log.activity_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      Logged a {log.activity_type} activity
                      {log.activity_type === 'measure' && log.measurement_cm && ` (${log.measurement_cm} cm)`}
                    </h3>
                    <Link href={`/plants/${log.plant_id}`} className="text-sm text-green-600 hover:text-green-500 dark:text-green-500 dark:hover:text-green-400">
                      for {log.plant_name} ({log.plant_species})
                    </Link>
                  </div>
                </div>

                {log.notes && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500 italic">
                    "{log.notes}"
                  </p>
                )}

                {log.image_url && (
                  <div className="mt-4 relative h-64 sm:h-80 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image 
                      src={log.image_url} 
                      alt="Plant progress" 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {log.leaves_count > 0 && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-2">🍃</span>
                    {log.leaves_count} {log.leaves_count === 1 ? 'Leaf' : 'Leaves'}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 sm:px-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex space-x-4">
                <button 
                  onClick={() => handleToggleLeaf(log.log_id, log.viewer_has_leafed)}
                  className={`font-medium text-sm flex items-center space-x-1 transition-colors ${
                    log.viewer_has_leafed 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500'
                  }`}
                >
                  <span className="text-lg">🍃</span> 
                  <span>{log.viewer_has_leafed ? 'Leafed' : 'Give Leaf'}</span>
                </button>
                <button className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500 font-medium text-sm flex items-center space-x-1 transition-colors">
                  <span className="text-lg">💬</span> <span>Comment</span>
                </button>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center pt-4 pb-8">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white dark:bg-gray-800 text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-full font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
