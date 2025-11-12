"use client";

import { useState } from "react";
import { DollarSign, Send, Loader2 } from "lucide-react";
import { createInvoiceWithLineItems } from "@/server/actions/pipeline";
import { useRouter } from "next/navigation";

interface CreateInvoiceButtonProps {
  projectId: string;
  projectName: string;
  type: "deposit" | "final";
  amount: number;
  organizationId?: string;
  onSuccess?: () => void;
}

export function CreateInvoiceButton({
  projectId,
  projectName,
  type,
  amount,
  organizationId,
  onSuccess,
}: CreateInvoiceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateInvoice = async () => {
    if (!organizationId) {
      setError("Organization ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const result = await createInvoiceWithLineItems({
        projectId,
        organizationId,
        title: `${type === "deposit" ? "Deposit" : "Final Payment"} - ${projectName}`,
        description: `${type === "deposit" ? "50% Deposit" : "Final Payment (50%)"} for ${projectName}`,
        dueDate,
        tax: 0,
        invoiceType: type,
        items: [
          {
            description: `${type === "deposit" ? "50% Deposit" : "Final Payment (50%)"} - ${projectName}`,
            quantity: 1,
            rate: amount,
            amount: amount,
          },
        ],
      });

      if (result.success) {
        onSuccess?.();
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to create invoice");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
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
