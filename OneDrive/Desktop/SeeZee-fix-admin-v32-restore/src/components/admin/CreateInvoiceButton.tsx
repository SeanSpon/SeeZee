"use client";

import { useState } from "react";
import { DollarSign, Send, Loader2 } from "lucide-react";

interface CreateInvoiceButtonProps {
  projectId: string;
  projectName: string;
  type: "deposit" | "final";
  amount: number;
  onSuccess?: () => void;
}

export function CreateInvoiceButton({
  projectId,
  projectName,
  type,
  amount,
  onSuccess,
}: CreateInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          amountCents: Math.round(amount * 100), // Convert to cents
          label: type,
          description: `${type === "deposit" ? "50% Deposit" : "Final Payment"} - ${projectName}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, "_blank");
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Invoice creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCreateInvoice}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            type === "deposit"
              ? "bg-cyan-400 hover:bg-cyan-300 text-black"
              : "bg-blue-500 hover:bg-blue-400 text-white"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Create {type === "deposit" ? "Deposit" : "Final"} Invoice
            <span className="text-xs ml-1">(${amount.toLocaleString()})</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}
    </div>
  );
}
