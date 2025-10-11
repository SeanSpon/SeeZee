"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface StepData {
  id: number;
  question: string;
  type: "select" | "text" | "contact";
  options?: string[];
}

interface StepQuestionProps {
  data: StepData;
  onNext: (answer: any) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

export default function StepQuestion({ data, onNext, onBack, isFirst, isLast, isSubmitting = false }: StepQuestionProps) {
  const [answer, setAnswer] = useState<any>("");

  function handleNext() {
    if (!answer) return;
    onNext(answer);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">{data.question}</h2>

      {data.type === "select" && (
        <div className="grid grid-cols-2 gap-3">
          {data.options?.map((opt: string) => (
            <button
              key={opt}
              onClick={() => setAnswer(opt)}
              className={`rounded-md p-3 text-sm capitalize transition ${
                answer === opt
                  ? "bg-gradient-to-r from-[#7c5cff] to-[#22d3ee] text-white"
                  : "bg-white/5 border border-white/10 text-white/70 hover:border-[#7c5cff]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {data.type === "text" && (
        <textarea
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="type your response..."
          className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm text-white placeholder-white/40 focus:border-[#7c5cff] outline-none mt-2"
        />
      )}

      {data.type === "contact" && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="your name"
            className="rounded-md bg-white/5 border border-white/10 p-3 text-sm text-white placeholder-white/40 focus:border-[#7c5cff] outline-none"
            onChange={(e) => setAnswer({ ...answer, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="your email"
            className="rounded-md bg-white/5 border border-white/10 p-3 text-sm text-white placeholder-white/40 focus:border-[#22d3ee] outline-none"
            onChange={(e) => setAnswer({ ...answer, email: e.target.value })}
          />
        </div>
      )}

      <div className="flex justify-between mt-8">
        {!isFirst ? (
          <button onClick={onBack} className="text-white/60 text-sm hover:text-white transition">
            ← back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="rounded-md bg-gradient-to-r from-[#7c5cff] to-[#22d3ee] px-5 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(124,92,255,0.3)] hover:shadow-[0_0_25px_rgba(124,92,255,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "submitting..." : isLast ? "submit" : "next"}
        </button>
      </div>
    </div>
  );
}