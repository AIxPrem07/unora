import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  showSplash?: boolean;
}

export const AuthLayout = ({ children, showSplash = false }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e8e0c8] p-0 md:p-8">
      <div className="w-full h-[100dvh] md:w-[360px] md:h-[740px] bg-background md:rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Status Bar */}
       

        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div 
              key="splash"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 bg-background z-40 relative"
            >
              <div className="w-[72px] h-[72px] bg-primary rounded-[22px] flex items-center justify-center">
                <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
                  <circle cx="12" cy="22" r="8" fill="#C5D89D"/>
                  <circle cx="32" cy="22" r="8" fill="#C5D89D" opacity=".5"/>
                  <circle cx="22" cy="14" r="6" fill="white"/>
                  <circle cx="22" cy="30" r="6" fill="white" opacity=".6"/>
                </svg>
              </div>
              <h1 className="text-[32px] font-bold tracking-tight text-primary">unora</h1>
              <p className="text-[13px] text-muted tracking-[0.06em] uppercase font-medium">Where talent finds light</p>
              <div className="w-1.5 h-1.5 bg-[#b8d087] rounded-full mt-2" />
            </motion.div>
          ) : (
            <motion.main 
              key="auth-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto no-scrollbar pt-[72px] px-6 pb-6"
            >
              {children}
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};