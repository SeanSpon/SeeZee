'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PackageTier } from './packages';

export type QwizStep = 0 | 1 | 2 | 3 | 4; 
// 0=Package Selection, 1=Feature Builder, 2=Questions, 3=Contact, 4=Review

export interface QuestionAnswers {
  goals?: string[];
  targetAudience?: string[];
  inspirationUrls?: string;
  mustHaveFeatures?: string[];
  timeline?: string;
  budget?: string;
  contentReady?: boolean;
  designPreference?: string[];
  notes?: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone?: string;
  website?: string;
  timeline?: string;
  rush?: boolean;
}

export interface Totals {
  packageBase: number; // Base package price
  addons: number; // Additional features cost
  maintenance: number; // Monthly maintenance ($60/mo - required)
  rush: number; // Rush fee (15% if applicable)
  subtotal: number; // packageBase + addons + rush
  deposit: number; // 25% or $250 min
  total: number; // Total project cost
  monthly: number; // Monthly maintenance ($60/mo)
  recurring: boolean; // Always true (maintenance required)
}

export interface QwizState {
  // Navigation
  step: QwizStep;
  setStep: (step: QwizStep) => void;

  // Questionnaire ID
  qid: string | null;
  setQid: (qid: string) => void;

  // Package Selection (Step 0)
  package: PackageTier | null;
  setPackage: (pkg: PackageTier | null) => void;

  // Features (Step 1)
  features: string[]; // Selected feature IDs
  toggleFeature: (featureId: string) => void;
  setFeatures: (features: string[]) => void; // Bulk set when package selected

  // Pricing
  totals: Totals;
  setTotals: (totals: Totals) => void;

  // Questions (Step 2)
  questionnaire: QuestionAnswers;
  updateQuestionnaire: (answers: Partial<QuestionAnswers>) => void;

  // Contact Info (Step 3)
  contact: ContactInfo | null;
  setContact: (contact: ContactInfo) => void;

  // Status
  status: 'draft' | 'submitting' | 'submitted' | 'checkout' | 'paid' | 'error';
  setStatus: (status: QwizState['status']) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  step: 0 as QwizStep,
  qid: null,
  package: null,
  features: [],
  totals: {
    packageBase: 0,
    addons: 0,
    maintenance: 6000, // $60/month (required)
    rush: 0,
    subtotal: 0,
    deposit: 0,
    total: 0,
    monthly: 6000, // $60/month (required)
    recurring: true, // Always true
  },
  questionnaire: {},
  contact: null,
  status: 'draft' as const,
};

export const useQwizStore = create<QwizState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setQid: (qid) => set({ qid }),
      setPackage: (pkg) => set({ package: pkg }),
      
      toggleFeature: (featureId) =>
        set((state) => ({
          features: state.features.includes(featureId)
            ? state.features.filter((f) => f !== featureId)
            : [...state.features, featureId],
        })),
      
      setFeatures: (features) => set({ features }),
      setTotals: (totals) => set({ totals }),
      
      updateQuestionnaire: (answers) =>
        set((state) => ({
          questionnaire: { ...state.questionnaire, ...answers },
        })),
      
      setContact: (contact) => set({ contact }),
      setStatus: (status) => set({ status }),
      reset: () => set(initialState),
    }),
    {
      name: 'seezee-qwiz-package',
      // Only persist to sessionStorage for tab-specific state
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
