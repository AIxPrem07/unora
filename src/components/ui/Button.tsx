import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "disabled" | "children"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-accent text-primary hover:bg-[#B3C88A]",
      secondary: "bg-surface text-primary shadow-soft border border-black/5 hover:shadow-floating hover:border-black/10",
      ghost: "bg-transparent text-primary hover:bg-black/5",
      danger: "bg-red-50 text-red-600 hover:bg-red-100",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11", // Perfect square for icon-only buttons
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";