import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { cn } from '../../lib/utils';

export default function Saved() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSavedPosts();
  }, [user]);

  const fetchSavedPosts = async () => {
    setIsLoading(true);
    
    // Fetch the saves, and join the actual post data
    const { data, error } = await supabase
      .from('saves')
      .select(`
        id,
        posts (
          id,
          image_url,
          caption,
          profiles (full_name)
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching saved posts:", error);
    } else {
      // Map through the relational data to get a clean array of posts
      const formattedPosts = data?.map(save => save.posts).filter(Boolean) || [];
      setSavedPosts(formattedPosts);
    }
    
    setIsLoading(false);
  };

  return (
    <MobileLayout activeTab="saved">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h1 className="text-[22px] font-bold tracking-tight">My Moodboard</h1>
          <button className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft">
            <Plus className="w-[18px] h-[18px]" />
          </button>
        </div>
        <div className="px-5 text-[13px] text-muted pb-3">
          1 collection · {savedPosts.length} saved
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-2 flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="col-span-2 text-center text-muted text-sm py-10">
              Your moodboard is empty. Tap the ribbon on a post to save it!
            </div>
          ) : (
            savedPosts.map((post, index) => (
              <SavedCard 
                key={post.id} 
                title={post.profiles?.full_name || "Creator"} 
                imageUrl={post.image_url}
                aspect={index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"} 
              />
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

const SavedCard = ({ title, imageUrl, aspect }: any) => {
  const isRealImage = imageUrl?.startsWith('http');

  return (
    <div className={`rounded-xl overflow-hidden relative shadow-soft ${aspect} group cursor-pointer bg-black/5`}>
      {isRealImage ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className={cn("absolute inset-0 group-hover:scale-105 transition-transform duration-500", imageUrl || "fill-sage")} />
      )}
      
      {!isRealImage && (
        <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 pt-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="text-[13px] font-semibold text-white leading-tight truncate">{title}</div>
      </div>
    </div>
  );
};