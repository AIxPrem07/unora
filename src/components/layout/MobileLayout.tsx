import React from 'react';
import { Wifi, BatteryMedium } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'explore' | 'saved' | 'profile';
  showNav?: boolean;
}

export const MobileLayout = ({ children, activeTab = 'home', showNav = true }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e8e0c8] p-0 md:p-8">
      {/* Mobile Device Constrainer */}
      <div className="w-full h-[100dvh] md:w-[360px] md:h-[740px] bg-background md:rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Fake Status Bar (Optional, usually handled by actual OS) */}
       

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-11 pb-safe">
          {children}
        </main>

        {showNav && <BottomNav activeTab={activeTab} />}
      </div>
    </div>
  );
};