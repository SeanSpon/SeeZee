"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Only render portal on client side
  if (!mounted) {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a1128]/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizeClasses[size]} md:rounded-2xl rounded-t-2xl border border-white/10 md:border bg-gradient-to-br from-[#1e293b] to-[#0f172a] backdrop-blur-xl shadow-2xl h-[95vh] md:max-h-[90vh] flex flex-col z-[9999]`}
          >
            {/* Header - sticky on mobile */}
            <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-6 sticky top-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] z-10">
              <h2 className="text-xl md:text-2xl font-heading font-bold text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-2 md:p-2.5 text-slate-400 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>

            {/* Footer - sticky on mobile */}
            {footer && (
              <div className="border-t border-white/10 p-4 md:p-6 sticky bottom-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] z-10">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal using portal to document.body to avoid stacking context issues
  return createPortal(modalContent, document.body);
}
