import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { MobileLayout } from '../../components/layout/MobileLayout';

export default function Albums() {
  return (
    <MobileLayout activeTab="profile">
      <div className="px-5 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold tracking-tight">My Albums</h1>
          <div className="flex gap-2.5">
            <button className="w-[38px] h-[38px] bg-white rounded-xl flex items-center justify-center shadow-soft text-primary hover:bg-black/5 transition-colors">
              <LayoutGrid className="w-[18px] h-[18px]" />
            </button>
            <button className="w-[38px] h-[38px] bg-white rounded-xl flex items-center justify-center shadow-soft text-primary hover:bg-black/5 transition-colors">
              <Plus className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Pinned Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Pinned Collections</h2>
            <span className="text-xs text-muted font-medium cursor-pointer hover:text-primary">See all</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
            <AlbumCard title="Golden Hours" count="42 photos" fill="fill-sage" />
            <AlbumCard title="Abstract Series" count="28 photos" fill="fill-dusk" />
            <AlbumCard title="Street Life" count="63 photos" fill="fill-warm" />
          </div>
        </div>

        {/* Recent Uploads (Masonry-style Grid) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Recent Uploads</h2>
            <span className="text-xs text-muted font-medium cursor-pointer hover:text-primary">See all</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[2/3] fill-sky rounded-xl shadow-soft" />
            <div className="flex flex-col gap-2">
              <div className="aspect-square fill-blush rounded-xl shadow-soft" />
              <div className="aspect-square fill-earth rounded-xl shadow-soft" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="aspect-square fill-sage rounded-xl shadow-soft" />
              <div className="aspect-square fill-warm rounded-xl shadow-soft" />
            </div>
            <div className="aspect-[2/3] fill-dusk rounded-xl shadow-soft" />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

const AlbumCard = ({ title, count, fill }: { title: string, count: string, fill: string }) => (
  <div className="shrink-0 w-[180px] aspect-[3/4] rounded-2xl overflow-hidden relative shadow-soft cursor-pointer group">
    <div className={`absolute inset-0 ${fill} group-hover:scale-105 transition-transform duration-500`} />
    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-8">
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="text-[10px] text-white/60 mt-0.5">{count}</div>
    </div>
  </div>
);