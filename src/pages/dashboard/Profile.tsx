import React, { useEffect, useState, useRef } from 'react';
import { Settings, LogOut, Sparkles, Loader2, Camera, X, Check, Pin, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { PostCard } from './Home';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const targetUserId = id || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  const [activeTab, setActiveTab] = useState<'works' | 'albums' | 'saved'>('works');
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [socialStats, setSocialStats] = useState({ followers: 0, following: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingTarget, setIsFollowingTarget] = useState(false);

  // Post View State
  const [selectedPost, setSelectedPost] = useState<any>(null); 
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', username: '', bio: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Network Drawer States (NEW)
  const [networkTab, setNetworkTab] = useState<'followers' | 'following' | null>(null);
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      let avatarUrl = profile?.avatar_url;

      // 1. Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Make sure you have an "avatars" bucket in Supabase storage!
          .upload(fileName, avatarFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        }
      }

      // 2. Update the Database
      const { error } = await supabase.from('profiles').update({
        full_name: editForm.full_name,
        username: editForm.username,
        bio: editForm.bio,
        avatar_url: avatarUrl,
      }).eq('id', user.id);

      if (error) throw error;

      // 3. Close the editor and refresh
      setIsEditing(false);
      fetchProfileData();
    } catch (e: any) {
      alert("Failed to update profile: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (targetUserId) fetchProfileData();
  }, [targetUserId, user]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    const [profileRes, postsRes, followersRes, followingRes, followCheckRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', targetUserId).single(),
      supabase.from('posts').select('*, profiles:user_id (full_name, username, avatar_url)').eq('user_id', targetUserId).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
      !isOwnProfile ? supabase.from('follows').select('*').eq('follower_id', user?.id).eq('following_id', targetUserId).single() : Promise.resolve({ data: null })
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      if (isOwnProfile) {
        setEditForm({ full_name: profileRes.data.full_name || '', username: profileRes.data.username || '', bio: profileRes.data.bio || '' });
      }
    }
    
    if (postsRes.data) setUserPosts(postsRes.data);
    setSocialStats({ followers: followersRes.count || 0, following: followingRes.count || 0 });
    if (followCheckRes.data) setIsFollowingTarget(true);
    
    setIsLoading(false);
  };

  // NEW: Fetch exact users for the network drawer
  const loadNetwork = async (type: 'followers' | 'following') => {
    if (!user) return;
    setNetworkTab(type);
    setIsLoadingNetwork(true);
    
    try {
      if (type === 'followers') {
        const { data: follows } = await supabase.from('follows').select('follower_id').eq('following_id', user.id);
        const ids = follows?.map(f => f.follower_id) || [];
        if (ids.length) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
          setNetworkUsers(profiles || []);
        } else setNetworkUsers([]);
      } else {
        const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
        const ids = follows?.map(f => f.following_id) || [];
        if (ids.length) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
          setNetworkUsers(profiles || []);
        } else setNetworkUsers([]);
      }
    } catch (e) {
      console.error("Error loading network", e);
    }
    
    setIsLoadingNetwork(false);
  };

  const toggleFollow = async () => {
    if (!user) return;
    const wasFollowing = isFollowingTarget;
    setIsFollowingTarget(!wasFollowing);
    
    if (wasFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetUserId });
      setSocialStats(prev => ({ ...prev, followers: prev.followers - 1 }));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
      setSocialStats(prev => ({ ...prev, followers: prev.followers + 1 }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <MobileLayout activeTab={isOwnProfile ? "profile" : undefined}>
        <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      </MobileLayout>
    );
  }

  // ---- SINGLE POST VIEW OVERLAY ----
  if (selectedPost) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full bg-background overflow-y-auto pb-10">
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-black/5">
            <button onClick={() => setSelectedPost(null)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold">Creation</h1>
          </div>
          <div className="p-4">
            <PostCard post={selectedPost} currentUser={user} />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <MobileLayout activeTab="profile" showNav={false}>
        <div className="flex flex-col h-full bg-background animate-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-background sticky top-0 z-20">
            <button onClick={() => setIsEditing(false)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10">
              <X className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold">Edit Profile</h1>
            <button 
              onClick={handleSaveProfile} 
              disabled={isSaving} 
              className="bg-primary text-white text-[13px] font-bold px-4 py-1.5 rounded-full disabled:opacity-50 flex items-center transition-colors hover:bg-primary/90"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
              {isSaving ? '' : 'Save'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-20">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full border-4 border-background bg-accent flex items-center justify-center overflow-hidden shadow-soft">
                {(avatarPreview || profile?.avatar_url) ? (
                  <img src={avatarPreview || profile?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[28px] font-extrabold text-primary">{profile?.full_name?.substring(0,2).toUpperCase()}</span>
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="text-[13px] font-bold text-primary bg-surface px-4 py-2 rounded-xl shadow-sm border border-black/5">
                Change Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} 
              />
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.full_name} 
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                  className="w-full bg-surface px-4 py-3.5 rounded-2xl border border-black/5 focus:border-accent outline-none text-[14px] font-bold transition-colors" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider pl-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">@</span>
                  <input 
                    type="text" 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '')})} 
                    className="w-full bg-surface pl-8 pr-4 py-3.5 rounded-2xl border border-black/5 focus:border-accent outline-none text-[14px] font-bold transition-colors" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider pl-1">Artist Bio</label>
                <textarea 
                  rows={3} 
                  value={editForm.bio} 
                  onChange={e => setEditForm({...editForm, bio: e.target.value})} 
                  placeholder="Welcome to my creative space. ✦"
                  className="w-full bg-surface px-4 py-3.5 rounded-2xl border border-black/5 focus:border-accent outline-none text-[13px] font-medium resize-none transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout activeTab={isOwnProfile ? "profile" : undefined}>
      <div className="relative flex flex-col h-full">
        
        {/* Header Actions */}
        <div className="h-[110px] w-full bg-gradient-to-br from-[#b8d087] via-[#8aac5c] to-accent relative shrink-0">
           {!isOwnProfile && (
             <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/30">
               <ChevronLeft className="w-5 h-5" />
             </button>
           )}
           {isOwnProfile && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={handleSignOut} className="w-[38px] h-[38px] bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white"><LogOut className="w-4 h-4" /></button>
              <button onClick={() => setIsEditing(true)} className="w-[38px] h-[38px] bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white"><Settings className="w-5 h-5" /></button>
            </div>
           )}
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center -mt-10 relative z-10 px-6 shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-background bg-accent flex items-center justify-center text-[28px] font-extrabold text-primary shadow-soft overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : profile?.full_name?.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-2">{profile?.full_name}</h2>
          <p className="text-[13px] text-muted font-medium">@{profile?.username}</p>
          <p className="text-[13px] text-primary text-center leading-relaxed mt-1.5 opacity-75">{profile?.bio || 'Welcome to my creative space. ✦'}</p>
        </div>

        {/* STATS SECTION UPDATED: 
          Numbers are now visible to everyone. 
          onClick is only active if it's your own profile. 
        */}
        <div className="flex justify-center gap-8 my-5 shrink-0">
          <Stat 
            value={socialStats.followers.toString()} 
            label="Followers" 
            onClick={isOwnProfile ? () => loadNetwork('followers') : undefined} 
          />
          <div className="w-px h-9 bg-black/10 my-auto" />
          <Stat 
            value={socialStats.following.toString()} 
            label="Following" 
            onClick={isOwnProfile ? () => loadNetwork('following') : undefined} 
          />
          <div className="w-px h-9 bg-black/10 my-auto" />
          <Stat value={userPosts.length.toString()} label="Works" />
        </div>

        {/* Dynamic Buttons */}
        <div className="flex gap-2.5 px-5 w-full shrink-0">
          {isOwnProfile ? (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1 h-11 text-[13px]">Edit Profile</Button>
              <Button variant="secondary" className="flex-1 h-11 text-[13px]">Share Profile</Button>
            </>
          ) : (
            <>
              <Button onClick={toggleFollow} className={cn("flex-1 h-11 text-[13px]", isFollowingTarget ? "bg-surface text-primary border border-black/10" : "")}>
                {isFollowingTarget ? 'Following' : 'Follow'}
              </Button>
              <Button variant="secondary" className="flex-1 h-11 text-[13px]">Message</Button>
            </>
          )}
        </div>

        {/* Tabs & Grid */}
        <div className="flex px-5 mt-4 border-b border-black/5 shrink-0">
          <Tab label="Works" active={activeTab === 'works'} onClick={() => setActiveTab('works')} />
          {isOwnProfile && <Tab label="Saved" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />}
        </div>

        <div className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'works' && (
            <div className="grid grid-cols-3 gap-1 px-3 pt-3">
              {userPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)} 
                  className={cn("aspect-square rounded-sm overflow-hidden bg-black/5 relative cursor-pointer hover:opacity-90 transition-opacity", !post.image_url?.startsWith('http') && post.image_url)}
                >
                  {post.is_pinned && <div className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full z-10"><Pin className="w-3 h-3 text-white fill-white" /></div>}
                  {post.image_url?.startsWith('http') && <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- NETWORK DRAWER OVERLAY ---- */}
        {networkTab && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-background">
              <h2 className="text-base font-bold capitalize">{networkTab}</h2>
              <button onClick={() => setNetworkTab(null)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-background">
              {isLoadingNetwork ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
              ) : networkUsers.length === 0 ? (
                <div className="text-center text-muted text-sm py-10 font-medium">No users found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {networkUsers.map(u => (
                    <div key={u.id} onClick={() => { setNetworkTab(null); navigate(`/profile/${u.id}`); }} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-black/5 cursor-pointer hover:border-black/15">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden text-[12px]">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.full_name?.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold">{u.full_name}</div>
                        <div className="text-[11px] text-muted">@{u.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}

// Updated Stat Component to accept onClick for the drawer
const Stat = ({ value, label, onClick }: { value: string, label: string, onClick?: () => void }) => (
  <div onClick={onClick} className={cn("flex flex-col items-center gap-0.5", onClick && "cursor-pointer hover:opacity-70 transition-opacity")}>
    <div className="text-lg font-bold">{value}</div>
    <div className="text-[11px] text-muted font-medium tracking-[0.04em] uppercase">{label}</div>
  </div>
);

const Tab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={cn("flex-1 py-3 text-center text-[13px] font-semibold border-b-2 transition-colors", active ? "text-primary border-primary" : "text-muted border-transparent")}>{label}</button>
);