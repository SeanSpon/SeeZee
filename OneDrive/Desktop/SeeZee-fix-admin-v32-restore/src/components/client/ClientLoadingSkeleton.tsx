"use client";

import { motion } from "framer-motion";

interface ClientLoadingSkeletonProps {
  variant?: "card" | "table" | "list" | "grid";
  count?: number;
  className?: string;
}

export function ClientLoadingSkeleton({ variant = "card", count = 1, className = "" }: ClientLoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="seezee-glass p-6 rounded-xl animate-pulse">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        );
      case "table":
        return (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        );
      case "list":
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="seezee-glass p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        );
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="seezee-glass p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded w-full mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        );
      default:
        return <div className="h-32 bg-white/10 rounded-xl animate-pulse" />;
    }
  };

  return (
    <div className={className}>
      {variant === "card" || variant === "grid" || variant === "list" ? (
        <>
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {renderSkeleton()}
            </motion.div>
          ))}
        </>
      ) : (
        renderSkeleton()
      )}
    </div>
  );
}

