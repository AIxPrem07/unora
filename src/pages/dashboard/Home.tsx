import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, MoreHorizontal, MessageSquare, Share, Image as ImageIcon, Loader2, Sparkles, Ribbon, Palette, Code, Music, Pin, Plus, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { cn } from '../../lib/utils';

// The aesthetic color palette for Thought Canvases
const CANVAS_COLORS = [
  { id: 'dark', class: 'bg-zinc-900 text-white' },
  { id: 'sage', class: 'bg-[#b8d087] text-zinc-900' },
  { id: 'vintage', class: 'bg-[#8D7B68] text-white' },
  { id: 'light', class: 'bg-white text-zinc-900 border border-black/10' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  // --- THOUGHT CANVAS STATES ---
  // (Notice how these are safely INSIDE the Home function!)
  const [isCreatingThought, setIsCreatingThought] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [thoughtColor, setThoughtColor] = useState(CANVAS_COLORS[0]);
  const [isPostingThought, setIsPostingThought] = useState(false);
  
  // The Viewer State
  const [viewingThought, setViewingThought] = useState<any>(null); 

  useEffect(() => {
    fetchFeedData();
    if (user) checkUnreadNotifications();
  }, [user]);

  const fetchFeedData = async () => {
    setIsLoading(true);
    
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles:user_id (full_name, username, avatar_url)')
      .order('created_at', { ascending: false });

    // Fetch thoughts from only the last 24 hours
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const { data: thoughtsData } = await supabase
      .from('thoughts')
      .select('*, profiles:user_id (full_name, avatar_url)')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);
    if (thoughtsData) setThoughts(thoughtsData);
    
    setIsLoading(false);
  };

  const checkUnreadNotifications = async () => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', user?.id).eq('is_read', false);
    setHasUnread((count || 0) > 0);
  };

  const handlePostThought = async () => {
    if (!thoughtText.trim() || !user || isPostingThought) return;
    setIsPostingThought(true);

    const { error } = await supabase.from('thoughts').insert({
      user_id: user.id,
      text: thoughtText.trim(),
      bg_color: thoughtColor.class
    });

    if (!error) {
      setThoughtText('');
      setIsCreatingThought(false);
      fetchFeedData(); 
    } else {
      alert("Failed to post thought.");
    }
    setIsPostingThought(false);
  };

  return (
    <MobileLayout activeTab="home" showNav={!isCreatingThought && !viewingThought}>
      
      {/* ---- THOUGHT CREATOR OVERLAY ---- */}
      {isCreatingThought && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <button onClick={() => setIsCreatingThought(false)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold">New Canvas</div>
            <button 
              onClick={handlePostThought} 
              disabled={!thoughtText.trim() || isPostingThought}
              className="bg-primary text-white text-[13px] font-bold px-4 py-1.5 rounded-full disabled:opacity-50 flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
            >
              {isPostingThought ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8">
            <div className={cn("w-full aspect-square rounded-[24px] shadow-lg p-6 flex items-center justify-center text-center transition-colors duration-300", thoughtColor.class)}>
              <textarea
                autoFocus
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value.slice(0, 150))}
                placeholder="What's on your mind?"
                className="w-full bg-transparent outline-none resize-none text-xl font-bold placeholder:opacity-50 text-center"
                rows={4}
              />
            </div>
            <div className="text-[11px] font-medium opacity-50 text-center">{thoughtText.length} / 150</div>

            <div className="flex gap-4 bg-surface p-3 rounded-full shadow-soft border border-black/5">
              {CANVAS_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setThoughtColor(color)}
                  className={cn("w-10 h-10 rounded-full shadow-sm transition-transform border-2", color.class.split(' ')[0], thoughtColor.id === color.id ? "scale-110 border-primary" : "border-transparent hover:scale-105")}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- THOUGHT VIEWER OVERLAY ---- */}
      {viewingThought && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div 
              onClick={() => { setViewingThought(null); navigate(`/profile/${viewingThought.user_id}`); }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {viewingThought.profiles?.avatar_url ? (
                  <img src={viewingThought.profiles.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  viewingThought.profiles?.full_name?.substring(0,2).toUpperCase()
                )}
              </div>
              <div className="text-sm font-bold">{viewingThought.profiles?.full_name}</div>
            </div>
            
            <button onClick={() => setViewingThought(null)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className={cn("w-full aspect-square rounded-[32px] shadow-2xl p-8 flex items-center justify-center text-center", viewingThought.bg_color)}>
              <div className="text-2xl font-bold leading-snug break-words">
                {viewingThought.text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className="flex items-center justify-between px-5 pt-3 pb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h1 className="text-[22px] font-extrabold tracking-tight">unora</h1>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate('/notifications')} className="w-[38px] h-[38px] bg-surface rounded-xl flex items-center justify-center shadow-soft relative text-primary hover:bg-black/5 transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {hasUnread && <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#b8d087] rounded-full border-[1.5px] border-background animate-pulse shadow-sm"></div>}
          </button>
        </div>
      </header>

      {/* ---- THE THOUGHT CAROUSEL ---- */}
      <div className="flex gap-3 px-5 py-4 overflow-x-auto no-scrollbar items-center border-b border-black/5">
        <div onClick={() => setIsCreatingThought(true)} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className="w-[60px] h-[60px] rounded-[18px] bg-surface border-2 border-dashed border-black/15 flex items-center justify-center text-primary group-hover:bg-black/5 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-muted font-bold tracking-wide">New Canvas</span>
        </div>

        {thoughts.map((thought) => (
          <div 
            key={thought.id} 
            onClick={() => setViewingThought(thought)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className={cn("w-[60px] h-[60px] rounded-[18px] p-2 flex items-center justify-center shadow-sm overflow-hidden relative", thought.bg_color)}>
              <div className="text-[7px] leading-tight font-bold text-center line-clamp-4 opacity-90 break-words w-full">
                {thought.text}
              </div>
            </div>
            <span className="text-[10px] text-primary font-bold w-[60px] text-center truncate">
              {thought.profiles?.full_name?.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Dynamic Feed */}
      <div className="flex flex-col gap-4 px-4 pb-2 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted py-10 text-sm font-medium">No posts yet. Be the first to share!</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} />)
        )}
      </div>
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------
// POST CARD COMPONENT
// ----------------------------------------------------------------------
export const PostCard = ({ post, currentUser }: { post: any, currentUser: any }) => {
  const [isSparkled, setIsSparkled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  
  const [sparkleCount, setSparkleCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPinned, setIsPinned] = useState(post.is_pinned || false);

  const isOwnPost = currentUser?.id === post.user_id;

  useEffect(() => {
    if (!currentUser) return;
    
    const checkInteractions = async () => {
      const { count: sCount, data: sData } = await supabase.from('sparkles').select('*', { count: 'exact' }).eq('post_id', post.id);
      setSparkleCount(sCount || 0);
      setIsSparkled(!!sData?.some(s => s.user_id === currentUser.id));

      const { data: saveData } = await supabase.from('saves').select('*').eq('post_id', post.id).eq('user_id', currentUser.id).maybeSingle();
      if (saveData) setIsSaved(true);

      const { count: rCount, data: rData } = await supabase.from('reposts').select('*', { count: 'exact' }).eq('post_id', post.id);
      setRepostCount(rCount || 0);
      setIsReposted(!!rData?.some(r => r.user_id === currentUser.id));

      if (!isOwnPost) {
        const { data: followData } = await supabase.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', post.user_id).maybeSingle();
        if (followData) setIsFollowing(true);
      }

      const { count: cCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
      setCommentCount(cCount || 0);
    };

    checkInteractions();
  }, [post.id, currentUser]);

  useEffect(() => {
    if (showComments) {
      const loadComments = async () => {
        const { data } = await supabase.from('comments').select('*, profiles(full_name, username)').eq('post_id', post.id).order('created_at', { ascending: true });
        if (data) setComments(data);
      };
      loadComments();
    }
  }, [showComments, post.id]);

  const handleSparkle = async () => {
    if (!currentUser) return;
    const wasSparkled = isSparkled; setIsSparkled(!wasSparkled); setSparkleCount(prev => wasSparkled ? prev - 1 : prev + 1);
    if (wasSparkled) await supabase.from('sparkles').delete().match({ post_id: post.id, user_id: currentUser.id });
    else await supabase.from('sparkles').insert({ post_id: post.id, user_id: currentUser.id });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    const wasSaved = isSaved; setIsSaved(!wasSaved);
    if (wasSaved) await supabase.from('saves').delete().match({ post_id: post.id, user_id: currentUser.id });
    else await supabase.from('saves').insert({ post_id: post.id, user_id: currentUser.id });
  };

  const handleRepost = async () => {
    if (!currentUser) return;
    const wasReposted = isReposted; setIsReposted(!wasReposted); setRepostCount(prev => wasReposted ? prev - 1 : prev + 1);
    if (wasReposted) await supabase.from('reposts').delete().match({ post_id: post.id, user_id: currentUser.id });
    else await supabase.from('reposts').insert({ post_id: post.id, user_id: currentUser.id });
  };

  const handleFollow = async () => {
    if (!currentUser || isOwnPost) return;
    const wasFollowing = isFollowing; setIsFollowing(!wasFollowing);
    if (wasFollowing) await supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: post.user_id });
    else await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: post.user_id });
  };

  const postComment = async () => {
    if (!newComment.trim() || !currentUser || isPostingComment) return;
    setIsPostingComment(true);
    const { data, error } = await supabase.from('comments').insert({ post_id: post.id, user_id: currentUser.id, text: newComment.trim() }).select('*, profiles(full_name, username)').single();
    if (!error && data) { setComments([...comments, data]); setCommentCount(prev => prev + 1); setNewComment(''); }
    setIsPostingComment(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this creation?")) { setShowMenu(false); return; }
    setIsDeleted(true); 
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) { setIsDeleted(false); alert("Failed to delete post."); }
  };

  const handlePinToggle = async () => {
    const wasPinned = isPinned;
    setIsPinned(!wasPinned); 
    setShowMenu(false);

    const { error } = await supabase
      .from('posts')
      .update({ is_pinned: !wasPinned })
      .eq('id', post.id);
      
    if (error) {
      setIsPinned(wasPinned); 
      alert("Failed to update pin status.");
    }
  };

  if (isDeleted) return null;

  const author = {
    name: post.profiles?.full_name || "Unknown Creator", 
    initials: post.profiles?.full_name?.substring(0, 2).toUpperCase() || "??", 
    role: `@${post.profiles?.username}`,
  };

  const isRealImage = post.image_url?.startsWith('http');
  
  const renderCategoryBadge = () => {
    switch(post.category) {
      case 'logic': return <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none z-10 shadow-sm"><Code className="w-3 h-3" /> LOGIC</div>;
      case 'vision': return <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none z-10 shadow-sm"><Palette className="w-3 h-3" /> VISION</div>;
      case 'frequency': return <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none z-10 shadow-sm"><Music className="w-3 h-3" /> FREQUENCY</div>;
      default: return <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none z-10 shadow-sm"><Sparkles className="w-3 h-3" /> VIBE</div>;
    }
  };

  return (
    <div className="bg-surface rounded-[20px] overflow-hidden shadow-soft">
      <div className="flex items-center justify-between p-3.5 px-4 relative">
        <div 
          onClick={() => window.location.href = `/profile/${post.user_id}`} 
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-white overflow-hidden">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : author.initials}
          </div>
          <div>
            <div className="text-[13px] font-semibold">{author.name}</div>
            <div className="text-[11px] text-muted">{author.role}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isOwnPost && (
            <button onClick={handleFollow} className={cn("text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors", isFollowing ? "bg-black/5 text-primary hover:bg-black/10" : "bg-primary text-white hover:bg-primary/90")}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          <MoreHorizontal onClick={() => setShowMenu(!showMenu)} className="w-5 h-5 text-muted cursor-pointer hover:text-primary transition-colors" />
        </div>

        {showMenu && (
          <div className="absolute top-12 right-4 w-40 bg-surface rounded-xl shadow-lg border border-black/5 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            {isOwnPost ? (
              <>
                <button onClick={handlePinToggle} className="w-full text-left px-4 py-3 text-sm font-bold text-primary hover:bg-black/5 transition-colors cursor-pointer border-b border-black/5 flex items-center justify-between">
                  {isPinned ? 'Unpin' : 'Pin to Profile'}
                  <Pin className={cn("w-3.5 h-3.5", isPinned && "fill-primary")} />
                </button>
                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                  Delete Post
                </button>
              </>
            ) : (
              <button onClick={() => { setShowMenu(false); alert("Reported."); }} className="w-full text-left px-4 py-3 text-sm font-bold text-primary hover:bg-black/5 transition-colors cursor-pointer">
                Report Content
              </button>
            )}
          </div>
        )}
      </div>

      <div className={cn("w-full relative bg-black/5 flex items-center justify-center max-h-[600px]", !isRealImage && post.image_url)}>
        {renderCategoryBadge()}
        {isRealImage ? (
          <img src={post.image_url} alt="Post" className="w-full h-auto max-h-[600px] object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
            <ImageIcon className="w-16 h-16 text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 px-4 pt-4 pb-2 text-muted">
        <button onClick={handleSparkle} className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer", isSparkled ? "text-accent" : "hover:text-primary")}>
          <Sparkles className={cn("w-5 h-5 transition-all duration-300", isSparkled && "fill-accent text-accent")} /> {sparkleCount > 0 && sparkleCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer", showComments ? "text-primary" : "hover:text-primary")}>
          <MessageSquare className={cn("w-5 h-5 transition-all", showComments && "fill-primary")} /> {commentCount > 0 && commentCount}
        </button>
        <button onClick={handleRepost} className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer", isReposted ? "text-accent" : "hover:text-primary")}>
          <Share className={cn("w-5 h-5 transition-all duration-300", isReposted && "fill-accent text-accent")} /> {repostCount > 0 && repostCount}
        </button>
        <button onClick={handleSave} className={cn("ml-auto transition-colors cursor-pointer", isSaved ? "text-accent" : "hover:text-primary")}>
          <Ribbon className={cn("w-5 h-5 transition-all duration-300", isSaved && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="px-4 pb-4 pt-1 text-[13px] leading-relaxed text-primary">
        {post.caption} <span className="text-accent font-semibold">{post.tags?.join(' ')}</span>
      </div>

      {showComments && (
        <div className="bg-black/5 border-t border-black/5 p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-[11px] text-muted text-center py-2">No comments yet. Be the first!</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="font-semibold text-[12px] text-primary whitespace-nowrap">{c.profiles?.username}:</div>
                <div className="text-[12px] text-primary/80 leading-snug break-words">{c.text}</div>
              </div>
            ))
          )}
          <div className="flex gap-2 mt-2 pt-2 border-t border-black/5">
            <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && postComment()} className="flex-1 bg-white text-xs px-3 py-2 rounded-xl outline-none border border-black/10 focus:border-accent" />
            <button onClick={postComment} disabled={!newComment.trim() || isPostingComment} className="bg-primary text-white text-[11px] font-bold px-3 rounded-xl disabled:opacity-50 cursor-pointer">
              {isPostingComment ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};