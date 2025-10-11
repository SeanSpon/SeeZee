"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepQuestion from "./StepQuestion";
import WizardProgress from "./WizardProgress";

const steps = [
  { id: 1, question: "what are you building?", type: "select" as const, options: ["website", "app", "automation", "branding", "other"] },
  { id: 2, question: "what's your goal with it?", type: "text" as const },
  { id: 3, question: "when do you want it live?", type: "select" as const, options: ["asap", "1–2 weeks", "this month", "no rush"] },
  { id: 4, question: "what's your budget range?", type: "select" as const, options: ["under $500", "$500–1,000", "$1,000–3,000", "$3,000+"] },
  { id: 5, question: "how can we reach you?", type: "contact" as const },
];

export default function ProjectWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/start-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
      } else {
        console.error("Error submitting project:", result.error);
        // You could set an error state here for user feedback
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      // You could set an error state here for user feedback
    } finally {
      setIsSubmitting(false);
    }
  }

  function next(answer: any) {
    setAnswers((prev: any) => ({ ...prev, [steps[step].question]: answer }));
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <motion.div
      className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(124,92,255,0.1)] relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            <StepQuestion
              data={steps[step]}
              onNext={next}
              onBack={back}
              isFirst={step === 0}
              isLast={step === steps.length - 1}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-white"
          >
            <h2 className="text-2xl font-semibold mb-2">project received 🚀</h2>
            <p className="text-white/70 text-sm mb-4">we'll review your info and reach out soon.</p>
            <p className="text-white/50 text-xs">
              check your email for confirmation and next steps
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && <WizardProgress step={step} total={steps.length} />}
    </motion.div>
  );
}