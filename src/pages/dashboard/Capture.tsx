import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Sparkles, Palette, Code, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { cn } from '../../lib/utils';

const CATEGORIES = [
  { id: 'vibe', label: 'Vibe', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'vision', label: 'Vision', icon: <Palette className="w-4 h-4" /> },
  { id: 'logic', label: 'Logic', icon: <Code className="w-4 h-4" /> },
  { id: 'frequency', label: 'Frequency', icon: <Music className="w-4 h-4" /> },
];

export default function Capture() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('vibe');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublish = async () => {
    if (!selectedFile || !user || isPublishing) return;
    setIsPublishing(true);

    try {
      // 1. Upload to Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      // 3. Save to Database WITH the new Category
      const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption.trim(),
        category: selectedCategory, // Added Category!
        tags: ['#unora', `#${selectedCategory}`]
      });

      if (dbError) throw dbError;

      // Success! Go back home
      navigate('/home');
    } catch (error: any) {
      console.error("Error publishing:", error.message);
      alert("Failed to publish creation.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col h-full bg-background">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-background sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-primary hover:bg-black/10">
            <X className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold">New Creation</h1>
          <button 
            onClick={handlePublish} 
            disabled={!selectedFile || isPublishing} 
            className="px-4 py-1.5 bg-primary rounded-full text-white text-[13px] font-bold shadow-soft disabled:opacity-50 transition-colors hover:bg-primary/90"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mx-2" /> : 'Publish'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          
          {/* Image Selection Area */}
          <div className="p-5">
            {!previewUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/5] bg-surface border-2 border-dashed border-black/10 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 hover:border-black/20 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-bold text-muted">Tap to select media</div>
              </div>
            ) : (
              <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-soft bg-black/5">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={clearSelection}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>

          {/* Form Area */}
          <div className="px-5 flex flex-col gap-6">
            
            {/* The Taxonomy (Category Selector) */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Exhibition Category</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all border-[1.5px] whitespace-nowrap",
                      selectedCategory === cat.id 
                        ? "bg-primary text-white border-primary shadow-soft" 
                        : "bg-surface text-primary border-black/5 hover:border-black/15"
                    )}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Artist Statement</label>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your work..."
                rows={4}
                className="w-full bg-surface px-4 py-3 rounded-2xl border border-black/5 focus:border-accent outline-none text-[13px] font-medium transition-colors resize-none placeholder:text-muted"
              />
            </div>
          </div>

        </div>
      </div>
    </MobileLayout>
  );
}