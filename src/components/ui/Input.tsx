import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, rightElement, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "w-full h-12 bg-white border-[1.5px] border-transparent rounded-[14px] px-4 text-sm font-sans text-primary shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors focus:outline-none focus:border-[#b8d087] disabled:opacity-50 disabled:bg-black/5",
              error && "border-red-500 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#b8d087]">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";