import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { cn } from '../../lib/utils';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      markAsRead();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id (full_name, username, avatar_url),
        post:post_id (image_url, caption)
      `)
      .eq('recipient_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data || []);
    setIsLoading(false);
  };

  const markAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user.id).eq('is_read', false);
  };

  return (
    <MobileLayout activeTab="home" showNav={false}>
      <div className="px-5 pt-4 pb-20 h-full overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-background/95 backdrop-blur-md py-2 z-10">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full hover:bg-black/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-primary" />
          </button>
          <h1 className="text-[22px] font-bold tracking-tight">Activity</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted text-sm py-10 mt-10">
            No activity yet. Share some work to get noticed!
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <NotificationItem key={notif.id} data={notif} />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

const NotificationItem = ({ data }: { data: any }) => {
  const isRealImage = data.post?.image_url?.startsWith('http');
  const initials = data.sender?.full_name?.substring(0, 2).toUpperCase() || '??';

  return (
    <div className={cn("flex items-center gap-3 py-3 border-b border-black/5 last:border-0", !data.is_read && "bg-accent/5 -mx-5 px-5 rounded-lg")}>
      
      {/* Sender Avatar */}
      <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[15px] font-bold bg-primary text-white">
        {initials}
      </div>
      
      {/* Notification Text */}
      <div className="flex-1">
        <div className="text-[13px] leading-[1.4] text-primary">
          <b>{data.sender?.full_name}</b>{' '}
          {data.type === 'sparkle' && 'sparkled your creation.'}
          {data.type === 'follow' && 'started following you.'}
          {data.type === 'comment' && 'commented on your post.'}
        </div>
        <div className="text-[13px] leading-[1.4] text-primary">
          <b>{data.sender?.full_name}</b>{' '}
          {data.type === 'sparkle' && 'sparkled your creation.'}
          {data.type === 'follow' && 'started following you.'}
          {data.type === 'comment' && 'commented on your post.'}
          {data.type === 'repost' && 'reposted your work.'}
        </div>
      </div>
      
      {/* Post Thumbnail (if applicable) */}
      {data.post && (
        <div className="w-11 h-11 rounded-[10px] shrink-0 overflow-hidden relative shadow-soft bg-black/5">
           {isRealImage ? (
             <img src={data.post.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
           ) : (
             <div className={cn("absolute inset-0", data.post.image_url || "bg-accent")} />
           )}
        </div>
      )}

      {/* Follow Back Button (if it's a follow notification) */}
      {data.type === 'follow' && (
        <button className="shrink-0 bg-primary text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-[10px] hover:bg-primary/90 transition-colors">
          View
        </button>
      )}

      {/* Unread dot */}
      {!data.is_read && <div className="w-2 h-2 bg-accent rounded-full shrink-0" />}
    </div>
  );
};