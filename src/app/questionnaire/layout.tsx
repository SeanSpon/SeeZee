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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {children}
      </div>
    </div>
  );
}
