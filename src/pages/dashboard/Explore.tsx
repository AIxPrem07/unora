import React, { useEffect, useState } from 'react';
import { Search, Camera, Palette, Music, TrendingUp, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { cn } from '../../lib/utils';

export default function Explore() {
  const [searchMode, setSearchMode] = useState<'creations' | 'creators'>('creations');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Re-fetch whenever the mode, category, or search query changes
  useEffect(() => {
    if (searchMode === 'creations') {
      fetchExploreData();
    } else {
      fetchUsers();
    }
  }, [activeCategory, searchQuery, searchMode]);

  const fetchExploreData = async () => {
    setIsLoading(true);
    let query = supabase
      .from('posts')
      .select('*, profiles:user_id (full_name, username, avatar_url)')
      .order('created_at', { ascending: false });

    // Filter by category
    if (activeCategory !== 'All') {
      query = query.contains('tags', [`#${activeCategory.toLowerCase()}`]);
    }

    // Filter by caption
    if (searchQuery.trim() !== '') {
      query = query.ilike('caption', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error) setPosts(data || []);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    // Filter by name or username
    if (searchQuery.trim() !== '') {
      query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error) setUsers(data || []);
    setIsLoading(false);
  };

  return (
    <MobileLayout activeTab="explore">
      <div className="flex flex-col h-full bg-background">
        
        {/* Sticky Header Section */}
        <div className="px-5 pt-5 pb-2 bg-background/95 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-[22px] font-bold tracking-tight mb-4">Discover</h1>
          
          {/* Dynamic Search Bar */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 h-12 shadow-soft border border-black/5 mb-4 transition-all focus-within:border-accent">
            <Search className="w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder={searchMode === 'creations' ? "Search captions, tags..." : "Search creators by name or @..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] font-semibold text-primary outline-none placeholder:text-muted placeholder:font-medium"
            />
          </div>

          {/* Search Mode Toggle */}
          <div className="flex gap-6 border-b border-black/10 px-1">
            <button 
              onClick={() => setSearchMode('creations')}
              className={cn(
                "pb-3 text-[13px] font-bold transition-all border-b-[3px]",
                searchMode === 'creations' ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary/70"
              )}
            >
              Creations
            </button>
            <button 
              onClick={() => setSearchMode('creators')}
              className={cn(
                "pb-3 text-[13px] font-bold transition-all border-b-[3px]",
                searchMode === 'creators' ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary/70"
              )}
            >
              Creators
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-24">
          
          {/* Category Chips - Only show for Creations */}
          {searchMode === 'creations' && (
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
              <Chip label="All" active={activeCategory === 'All'} onClick={() => setActiveCategory('All')} />
              <Chip label="Vibes" icon={<Camera className="w-[13px] h-[13px] mr-1" />} active={activeCategory === 'Vibes'} onClick={() => setActiveCategory('Vibes')} />
              <Chip label="Unora" icon={<Palette className="w-[13px] h-[13px] mr-1" />} active={activeCategory === 'Unora'} onClick={() => setActiveCategory('Unora')} />
              <Chip label="Music" icon={<Music className="w-[13px] h-[13px] mr-1" />} active={activeCategory === 'Music'} onClick={() => setActiveCategory('Music')} />
            </div>
          )}

          {/* Dynamic Loading & Results */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : searchMode === 'creations' ? (
            /* --- CREATIONS GRID --- */
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {posts.length === 0 ? (
                  <div className="col-span-2 text-center text-muted text-sm py-10 font-medium">No creations found.</div>
                ) : (
                  posts.map((post, index) => (
                    <DiscoverCard 
                      key={post.id}
                      title={post.profiles?.full_name || 'Unknown'} 
                      subtitle={`@${post.profiles?.username}`} 
                      imageUrl={post.image_url}
                      tall={index % 3 === 0} 
                    />
                  ))
                )}
              </div>
              
              <div className="flex flex-col pb-8">
                <h2 className="text-base font-bold mb-3">Trending Tags</h2>
                <TrendingItem rank="01" tag="#Unora" posts="142 posts this week" fill="fill-sage" />
                <TrendingItem rank="02" tag="#Vibes" posts="89 posts this week" fill="fill-dusk" />
              </div>
            </>
          ) : (
            /* --- CREATORS LIST --- */
            <div className="flex flex-col gap-3">
              {users.length === 0 ? (
                <div className="text-center text-muted text-sm py-10 font-medium">No creators found.</div>
              ) : (
                users.map((u) => (
                  <CreatorCard key={u.id} user={u} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

// --- SUBCOMPONENTS ---

const Chip = ({ label, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "shrink-0 flex items-center px-4 py-2 rounded-xl text-xs font-semibold tracking-[0.02em] transition-colors border-[1.5px]",
      active ? "bg-primary text-white border-primary" : "bg-white text-primary border-black/10 hover:border-black/20"
    )}
  >
    {icon}{label}
  </button>
);

const DiscoverCard = ({ title, subtitle, imageUrl, tall }: any) => {
  const isRealImage = imageUrl?.startsWith('http');
  return (
    <div className={cn("rounded-xl overflow-hidden relative shadow-soft cursor-pointer group bg-black/5", tall ? "aspect-[3/4]" : "aspect-square")}>
      {isRealImage ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className={cn("absolute inset-0 group-hover:scale-105 transition-transform duration-500", imageUrl || "bg-accent/40")} />
      )}
      {!isRealImage && (
        <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 pt-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-xs font-bold text-white truncate">{title}</div>
        <div className="text-[10px] text-white/70 font-medium mt-0.5 truncate">{subtitle}</div>
      </div>
    </div>
  );
};

const TrendingItem = ({ rank, tag, posts, fill }: any) => (
  <div className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0">
    <div className="text-sm font-bold text-muted w-5">{rank}</div>
    <div className={`w-11 h-11 rounded-[10px] shrink-0 ${fill}`} />
    <div className="flex-1">
      <div className="text-[13px] font-semibold">{tag}</div>
      <div className="text-[11px] text-muted mt-0.5">{posts}</div>
    </div>
    <TrendingUp className="w-4 h-4 text-muted" />
  </div>
);

const CreatorCard = ({ user }: { user: any }) => {
  const initials = user.full_name?.substring(0, 2).toUpperCase() || '??';
  
  return (
    <div 
      onClick={() => window.location.href = `/profile/${user.id}`}
      className="flex items-center gap-3 p-3.5 bg-surface rounded-[16px] shadow-soft border border-black/5 cursor-pointer hover:border-black/10 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-[15px] text-white font-bold overflow-hidden shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-primary truncate">{user.full_name}</div>
        <div className="text-[12px] text-muted font-medium truncate">@{user.username}</div>
      </div>
      <button className="shrink-0 bg-black/5 text-primary hover:bg-black/10 transition-colors text-[11px] font-bold px-4 py-2 rounded-xl">
        View
      </button>
    </div>
  );
};