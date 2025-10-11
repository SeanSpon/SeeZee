"use client";
import { motion } from "framer-motion";

interface WizardProgressProps {
  step: number;
  total: number;
}

export default function WizardProgress({ step, total }: WizardProgressProps) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {[...Array(total)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: step === i ? 28 : 8,
            backgroundColor: step === i ? "rgba(124,92,255,1)" : "rgba(255,255,255,0.2)",
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}