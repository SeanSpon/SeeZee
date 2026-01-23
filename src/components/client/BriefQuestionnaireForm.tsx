'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Layers, Building, Target, ArrowRight, FileText } from 'lucide-react';

export interface BriefQuestionnaireData {
  companyName: string;
  projectType: string;
  budgetRange: string;
  timelinePreference: string;
  keyFeatures: string[];
  currentWebsite: string;
  notes: string;
}

const PROJECT_TYPES = [
  { value: 'website', label: 'Business Website', icon: Globe },
  { value: 'web-app', label: 'Web Application', icon: Layers },
  { value: 'ecommerce', label: 'E-commerce Store', icon: Building },
  { value: 'landing-page', label: 'Landing Page', icon: FileText },
  { value: 'other', label: 'Other', icon: Target },
];

const BUDGET_RANGES = [
  { value: 'under-2k', label: 'Under $2,000' },
  { value: '2k-5k', label: '$2,000 - $5,000' },
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: '10k-20k', label: '$10,000 - $20,000' },
  { value: 'over-20k', label: 'Over $20,000' },
];

const TIMELINE_PREFERENCES = [
  { value: 'asap', label: 'ASAP (Rush)', icon: '🔥' },
  { value: '1-2-weeks', label: '1-2 Weeks', icon: '⚡' },
  { value: '1-month', label: 'Within 1 Month', icon: '📅' },
  { value: '2-3-months', label: '2-3 Months', icon: '📆' },
  { value: 'flexible', label: 'Flexible / No Rush', icon: '🌊' },
];

const KEY_FEATURES = [
  'Contact Form',
  'Blog/News',
  'E-commerce',
  'User Accounts',
  'Payment Integration',
  'CMS',
  'API Integration',
  'Mobile App',
  'Analytics Dashboard',
  'Live Chat',
  'Booking System',
  'Multi-language',
];

interface BriefQuestionnaireFormProps {
  onSubmit: (data: BriefQuestionnaireData) => Promise<void>;
}

export function BriefQuestionnaireForm({ onSubmit }: BriefQuestionnaireFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BriefQuestionnaireData, string>>>({});

  const [formData, setFormData] = useState<BriefQuestionnaireData>({
    companyName: '',
    projectType: '',
    budgetRange: '',
    timelinePreference: '',
    keyFeatures: [],
    currentWebsite: '',
    notes: '',
  });

  const updateField = <K extends keyof BriefQuestionnaireData>(
    field: K,
    value: BriefQuestionnaireData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.includes(feature)
        ? prev.keyFeatures.filter((f) => f !== feature)
        : [...prev.keyFeatures, feature],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BriefQuestionnaireData, string>> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.projectType) newErrors.projectType = 'Please select a project type';
    if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
    if (!formData.timelinePreference) newErrors.timelinePreference = 'Please select a timeline';
    if (formData.keyFeatures.length === 0) newErrors.keyFeatures = 'Please select at least one feature';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      alert('Failed to submit questionnaire. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Tell Us About Your Project</h1>
          <p className="text-slate-600 text-center">
            Help us understand your needs so we can provide the best solution for you
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-2">
              Company / Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Acme Inc."
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What type of project do you need? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROJECT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('projectType', type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.projectType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  </button>
                );
              })}
            </div>
            {errors.projectType && (
              <p className="mt-1 text-sm text-red-500">{errors.projectType}</p>
            )}
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What's your budget range? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {BUDGET_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => updateField('budgetRange', range.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.budgetRange === range.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{range.label}</span>
                </button>
              ))}
            </div>
            {errors.budgetRange && (
              <p className="mt-1 text-sm text-red-500">{errors.budgetRange}</p>
            )}
          </div>

          {/* Timeline Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              When do you need it completed? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIMELINE_PREFERENCES.map((timeline) => (
                <button
                  key={timeline.value}
                  type="button"
                  onClick={() => updateField('timelinePreference', timeline.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.timelinePreference === timeline.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{timeline.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{timeline.label}</div>
                </button>
              ))}
            </div>
            {errors.timelinePreference && (
              <p className="mt-1 text-sm text-red-500">{errors.timelinePreference}</p>
            )}
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What features do you need? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {KEY_FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`p-3 rounded-lg border-2 transition-all text-center text-sm ${
                    formData.keyFeatures.includes(feature)
                      ? 'border-blue-500 bg-blue-50 text-gray-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
            {errors.keyFeatures && (
              <p className="mt-1 text-sm text-red-500">{errors.keyFeatures}</p>
            )}
          </div>

          {/* Current Website */}
          <div>
            <label htmlFor="currentWebsite" className="block text-sm font-semibold text-gray-900 mb-2">
              Current Website URL (if any)
            </label>
            <input
              id="currentWebsite"
              type="url"
              value={formData.currentWebsite}
              onChange={(e) => updateField('currentWebsite', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes or Requirements
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tell us anything else that might help us understand your project better..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Packages
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

