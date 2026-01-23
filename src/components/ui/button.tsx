import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = 
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-lg",
      lg: "px-8 py-4 text-lg rounded-lg min-h-[48px]",
    };
    
    const variantStyles = {
      // Primary red CTA button
      primary:
        "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-lg focus:ring-red-500",
      // Secondary with border
      secondary:
        "bg-white/5 border-2 border-white/20 text-white hover:border-white hover:bg-white/10 focus:ring-white/50",
      // Outline that fills on hover
      outline:
        "bg-transparent border-2 border-white/20 text-white hover:border-[#ef4444] hover:bg-[#ef4444] focus:ring-red-500",
      // Ghost/subtle button
      ghost: 
        "bg-white/5 text-white hover:bg-white/10 focus:ring-white/50",
      // White button (for colored backgrounds)
      white:
        "bg-white text-[#ef4444] hover:bg-gray-100 shadow-lg focus:ring-white",
      // Danger/destructive action
      danger: 
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    return (
      <button
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
