'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BriefQuestionnaireForm, type BriefQuestionnaireData } from '@/components/client/BriefQuestionnaireForm';

export default function BriefQuestionnairePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/onboarding/brief-questionnaire');
    }

    // Check if user has already completed the questionnaire
    if (session?.user && (session.user as any).questionnaireCompleted) {
      router.push('/start');
    }
  }, [status, session, router]);

  const handleSubmit = async (data: BriefQuestionnaireData) => {
    try {
      const response = await fetch('/api/questionnaire/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit questionnaire');
      }

      // Redirect to package selection page
      router.push('/start');
    } catch (error: any) {
      console.error('Failed to submit questionnaire:', error);
      throw error;
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <BriefQuestionnaireForm onSubmit={handleSubmit} />;
}

