'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
}

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [plantsCount, setPlantsCount] = useState(0);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      if (resolvedParams?.id) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (profileError) {
          setError('User not found.');
        } else if (profileData) {
          setProfile(profileData);
          
          // Fetch follower/following counts
          const { count: f1 } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', resolvedParams.id);
          const { count: f2 } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', resolvedParams.id);
          const { count: p1 } = await supabase.from('plants').select('*', { count: 'exact', head: true }).eq('user_id', resolvedParams.id);
          
          setFollowersCount(f1 || 0);
          setFollowingCount(f2 || 0);
          setPlantsCount(p1 || 0);

          // Check if current user is following
          if (session?.user && session.user.id !== resolvedParams.id) {
            const { data: followData } = await supabase
              .from('follows')
              .select('*')
              .eq('follower_id', session.user.id)
              .eq('following_id', resolvedParams.id)
              .single();
              
            setIsFollowing(!!followData);
          }
        }
      }
      setLoading(false);
    };

    fetchProfileAndStats();
  }, [resolvedParams]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      alert("You must be logged in to follow users.");
      return;
    }

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', resolvedParams.id);
        
      if (!error) {
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: currentUser.id,
          following_id: resolvedParams.id
        }]);
        
      if (!error) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error || !profile) return <div className="p-8 text-center text-red-500">{error || 'User not found'}</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="h-32 bg-green-600 dark:bg-green-800"></div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-800 p-1">
              <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            {!isOwnProfile && currentUser && (
              <button
                onClick={handleToggleFollow}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                  isFollowing 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            
            {isOwnProfile && (
              <a href="/profile/setup" className="px-6 py-2 rounded-full font-medium text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Edit Profile
              </a>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
            {profile.bio && <p className="mt-2 text-gray-600 dark:text-gray-400">{profile.bio}</p>}
          </div>

          <div className="mt-6 flex space-x-6 border-t border-gray-100 dark:border-gray-700 pt-6">
            <div>
              <span className="font-bold text-gray-900 dark:text-white">{plantsCount}</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">Plants</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white">{followersCount}</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">Followers</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white">{followingCount}</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
