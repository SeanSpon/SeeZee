'use client';

import { motion } from 'framer-motion';
import { QUESTIONS } from '@/lib/qwiz/questions';
import { useQwizStore } from '@/lib/qwiz/store';

export function QuestionnaireForm() {
  const { questionnaire, updateQuestionnaire } = useQwizStore();

  const handleMultiSelect = (questionId: string, option: string) => {
    const current = (questionnaire[questionId as keyof typeof questionnaire] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateQuestionnaire({ [questionId]: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell us about your project
        </h2>
        <p className="text-white/60">Help us understand your vision</p>
      </div>

      {QUESTIONS.map((question, idx) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-section"
        >
          <label className="block">
            <div className="mb-3">
              <div className="text-lg font-semibold text-white mb-1">
                {question.label}
                {question.required && <span className="text-red-400 ml-1">*</span>}
              </div>
              {question.description && (
                <div className="text-sm text-white/60">{question.description}</div>
              )}
            </div>

            {question.type === 'multiselect' && question.options && (
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const selected = (
                    (questionnaire[question.id as keyof typeof questionnaire] as string[]) || []
                  ).includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelect(question.id, option)}
                      className={`
                        px-4 py-2 rounded-xl font-medium text-sm transition-all
                        ${
                          selected
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/50'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === 'select' && question.options && (
              <select
                value={(questionnaire[question.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [question.id]: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required={question.required}
              >
                <option value="">Select an option...</option>
                {question.options.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            )}

            {question.type === 'text' && (
              <input
                type="text"
                value={(questionnaire[question.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [question.id]: e.target.value })}
                placeholder={question.placeholder}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required={question.required}
              />
            )}

            {question.type === 'textarea' && (
              <textarea
                value={(questionnaire[question.id as keyof typeof questionnaire] as string) || ''}
                onChange={(e) => updateQuestionnaire({ [question.id]: e.target.value })}
                placeholder={question.placeholder}
                rows={4}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                required={question.required}
              />
            )}

            {question.type === 'boolean' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => updateQuestionnaire({ [question.id]: true })}
                  className={`
                    flex-1 px-6 py-4 rounded-xl font-semibold transition-all
                    ${
                      questionnaire[question.id as keyof typeof questionnaire] === true
                        ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/50'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateQuestionnaire({ [question.id]: false })}
                  className={`
                    flex-1 px-6 py-4 rounded-xl font-semibold transition-all
                    ${
                      questionnaire[question.id as keyof typeof questionnaire] === false
                        ? 'bg-slate-500/20 text-slate-300 border-2 border-slate-500/50'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  No
                </button>
              </div>
            )}
          </label>
        </motion.div>
      ))}
    </div>
  );
}
