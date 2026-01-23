'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/qwiz/questions';
import { useQwizStore } from '@/lib/qwiz/store';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export function QuestionnaireForm() {
  const router = useRouter();
  const { questionnaire, updateQuestionnaire, setStep } = useQwizStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleMultiSelect = (questionId: string, option: string) => {
    const current = (questionnaire[questionId as keyof typeof questionnaire] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateQuestionnaire({ [questionId]: updated });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // On first question, go back to package selection
      setStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push('/start');
  };

  const handleContinueToContact = () => {
    setStep(4); // Move to review step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isQuestionAnswered = () => {
    const answer = questionnaire[currentQuestion.id as keyof typeof questionnaire];
    
    if (!currentQuestion.required) return true;
    
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (currentQuestion.type === 'boolean') {
      return answer !== undefined;
    }
    return !!answer;
  };

  const allQuestionsAnswered = () => {
    const requiredQuestions = [
      'goals',
      'industry', 
      'targetAudience',
      'contentStatus',
      'timeline',
      'existingWebsite'
    ];
    
    return requiredQuestions.every((qId) => {
      const answer = questionnaire[qId as keyof typeof questionnaire];
      if (qId === 'existingWebsite') {
        return answer !== undefined;
      }
      if (Array.isArray(answer)) {
        return answer.length > 0;
      }
      return !!answer;
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/60">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-#ef4444 font-semibold">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-#ef4444"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex flex-col"
        >
          <div className="mb-6">
            <div className="text-2xl md:text-3xl font-heading font-bold gradient-text mb-3">
              {currentQuestion.label}
              {currentQuestion.required && <span className="text-#ef4444 ml-2">*</span>}
            </div>
            {currentQuestion.description && (
              <div className="text-base text-white/60">{currentQuestion.description}</div>
            )}
          </div>

          <div className="flex-1">
            {currentQuestion.type === 'multiselect' && currentQuestion.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = (
                    (questionnaire[currentQuestion.id as keyof typeof questionnaire] as string[]) || []
                  ).includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelect(currentQuestion.id, option)}
                      className={`
                        px-5 py-4 rounded-lg font-medium text-sm transition-all text-left
                        ${
                          selected
                            ? 'bg-#ef4444/20 text-#ef4444 border-2 border-#ef4444 shadow-lg shadow-#ef4444/25'
                            : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? 'bg-#ef4444 border-#ef4444' : 'border-gray-600'
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <select
                value={(questionnaire[currentQuestion.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [currentQuestion.id]: e.target.value })}
                className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all"
                required={currentQuestion.required}
              >
                <option value="">Select an option...</option>
                {currentQuestion.options.map((option) => (
                  <option key={option} value={option} className="bg-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            )}

            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={(questionnaire[currentQuestion.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [currentQuestion.id]: e.target.value })}
                placeholder={currentQuestion.placeholder}
                className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-base placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all"
                required={currentQuestion.required}
              />
            )}

            {currentQuestion.type === 'textarea' && (
              <textarea
                value={(questionnaire[currentQuestion.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [currentQuestion.id]: e.target.value })}
                placeholder={currentQuestion.placeholder}
                rows={6}
                className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-base placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:border-#ef4444 transition-all resize-none"
                required={currentQuestion.required}
              />
            )}

            {currentQuestion.type === 'boolean' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => updateQuestionnaire({ [currentQuestion.id]: true })}
                  className={`
                    flex-1 px-8 py-6 rounded-lg font-semibold text-lg transition-all
                    ${
                      questionnaire[currentQuestion.id as keyof typeof questionnaire] === true
                        ? 'bg-#ef4444/20 text-#ef4444 border-2 border-#ef4444 shadow-lg shadow-#ef4444/25'
                        : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateQuestionnaire({ [currentQuestion.id]: false })}
                  className={`
                    flex-1 px-8 py-6 rounded-lg font-semibold text-lg transition-all
                    ${
                      questionnaire[currentQuestion.id as keyof typeof questionnaire] === false
                        ? 'bg-gray-700/50 text-gray-300 border-2 border-gray-600 shadow-lg'
                        : 'bg-gray-800 text-white/70 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  No
                </button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentQuestionIndex === 0 ? 'Back to Packages' : 'Previous'}
            </button>

            <div className="flex items-center gap-2 text-sm text-white/40">
              {QUESTIONS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-#ef4444 w-6'
                      : idx < currentQuestionIndex
                      ? 'bg-#ef4444/50'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {currentQuestionIndex < QUESTIONS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isQuestionAnswered()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-#ef4444 hover:bg-#dc2626 transition-all duration-200 shadow-medium transform hover:-translate-y-1 glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-semibold text-white"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleContinueToContact}
                disabled={!allQuestionsAnswered()}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-#ef4444 hover:bg-#dc2626 transition-all duration-200 shadow-medium transform hover:-translate-y-1 glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-bold text-white"
              >
                <Check className="w-5 h-5" />
                Continue to Review
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
