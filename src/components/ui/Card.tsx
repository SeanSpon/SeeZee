"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "featured" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  className,
  variant = "default",
  padding = "md",
  hover = false,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    // Default card with subtle background
    default: "bg-white/5 border border-white/10",
    // Elevated with more prominent background
    elevated: "bg-[#1a2332]/50 border border-white/10 backdrop-blur-sm",
    // Glass morphism effect
    glass: "bg-white/5 backdrop-blur-md border border-white/10",
    // Featured/highlighted card with accent border
    featured: "bg-white/5 border-2 border-[#22d3ee] shadow-lg",
    // Outline only
    outlined: "bg-transparent border-2 border-white/20",
  };
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-300",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:border-white/20 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between mb-4",
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-white mb-1">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn("", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: "start" | "center" | "end" | "between";
}

export function CardFooter({
  className,
  justify = "end",
  children,
  ...props
}: CardFooterProps) {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 mt-6 pt-6 border-t border-white/10",
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}














