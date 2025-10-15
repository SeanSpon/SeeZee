import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Questionnaire | SeeZee',
  description: 'Tell us about your project vision and requirements',
};

export default function QuestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {children}
      </div>
    </div>
  );
}
