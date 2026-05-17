import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Plus, Bookmark, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'explore' | 'saved' | 'profile';
}

export const BottomNav = ({ activeTab }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="h-[72px] bg-surface border-t border-black/5 flex items-center justify-around px-2 sticky bottom-0 z-50">
      <NavItem 
        icon={Home} 
        label="Home" 
        isActive={activeTab === 'home'} 
        onClick={() => navigate('/home')}
      />
      <NavItem 
        icon={Search} 
        label="Explore" 
        isActive={activeTab === 'explore'} 
        onClick={() => navigate('/explore')}
      />
      
      {/* Central Action Button */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/capture')}
        className="flex flex-col items-center gap-1 flex-1 px-1 cursor-pointer relative"
      >
        <div className="w-[52px] h-[52px] bg-primary rounded-[18px] flex items-center justify-center shadow-floating">
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
      </motion.button>
      
      <NavItem 
        icon={Bookmark} 
        label="Saved" 
        isActive={activeTab === 'saved'} 
        onClick={() => navigate('/saved')}
      />
      <NavItem 
        icon={User} 
        label="Profile" 
        isActive={activeTab === 'profile'} 
        onClick={() => navigate('/profile')}
      />
    </nav>
  );
};

const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 flex-1 px-1 cursor-pointer relative transition-colors duration-200",
      isActive ? "text-primary" : "text-[#b0aa95] hover:text-primary/70"
    )}
  >
    <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[9px] font-semibold tracking-wider uppercase">{label}</span>
    {isActive && (
      <motion.div 
        layoutId="navIndicator"
        className="w-1 h-1 bg-primary rounded-full absolute -bottom-1.5" 
      />
    )}
  </div>
);