"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-500/10";
      case "error":
        return "border-red-500/50 bg-red-500/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10";
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto glass border rounded-lg p-4 min-w-[300px] max-w-[500px] shadow-lg animate-in slide-in-from-right ${getColors(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <p className="flex-1 text-sm text-white">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
