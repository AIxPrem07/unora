import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, User, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation config keeps our JSX clean
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: User, label: "Profile", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background font-sans text-primary">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed border-r border-black/5 bg-background p-6 z-20">
        <Logo />
        <nav className="flex flex-col gap-2 flex-1 mt-8">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>
      </aside>

      {/* --- Mobile Header & Menu --- */}
      <header className="h-16 md:hidden flex items-center justify-between px-6 border-b border-black/5 bg-background fixed top-0 w-full z-30">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden flex justify-end"
          >
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-surface shadow-floating p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavItem key={item.label} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Content Area --- */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

// --- Sub-components for cleanliness ---

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-primary">
      <Sparkles className="w-4 h-4" /> {/* Placeholder for your transparent icon */}
    </div>
    <h1 className="font-semibold tracking-tight text-xl">Unora</h1>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left font-medium",
      active 
        ? "bg-surface shadow-soft text-primary" 
        : "text-muted hover:bg-black/5 hover:text-primary"
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);