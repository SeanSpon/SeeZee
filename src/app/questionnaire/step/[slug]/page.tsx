import { redirect, notFound } from 'next/navigation';
import {
  StepSlugs,
  StepSchemas,
  StepLabels,
  StepDescriptions,
  StepInputTypes,
  StepOptions,
  type StepSlug,
} from '@/lib/steps';
import {
  getQuestionnaireId,
  getDraftById,
} from '@/lib/questionnaire';
import { saveStepAndRedirect } from '@/lib/questionnaire-actions';
import { ProgressBar } from '@/components/questionnaire/ProgressBar';
import { StepShell } from '@/components/questionnaire/StepShell';
import { NavButtons } from '@/components/questionnaire/NavButtons';
import { StepInput } from '@/components/questionnaire/StepInput';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return StepSlugs.map((slug) => ({ slug }));
}

export default async function StepPage({ params }: Props) {
  const { slug } = await params;

  // Validate slug
  const stepIndex = StepSlugs.indexOf(slug as StepSlug);
  if (stepIndex === -1) {
    notFound();
  }

  const stepSlug = slug as StepSlug;
  const currentStep = stepIndex + 1;
  const totalSteps = StepSlugs.length;

  // Get questionnaire ID from cookie (read-only)
  let qId = await getQuestionnaireId();
  let draft = null;
  
  if (qId) {
    draft = await getDraftById(qId);
  }

  // Get current value
  const currentValue = (draft?.data && typeof draft.data === 'object' && stepSlug in draft.data 
    ? (draft.data as Record<string, any>)[stepSlug] 
    : '') || '';

  // Navigation
  const prevSlug = stepIndex > 0 ? StepSlugs[stepIndex - 1] : null;
  const nextSlug = stepIndex < totalSteps - 1 ? StepSlugs[stepIndex + 1] : 'summary';

  const backHref = prevSlug ? `/questionnaire/step/${prevSlug}` : null;

  // Server action for form submission
  async function handleSubmit(formData: FormData) {
    'use server';

    const rawValue = formData.get(stepSlug);
    let value: any = rawValue;

    // Parse JSON for multiselect
    if (StepInputTypes[stepSlug] === 'multiselect') {
      try {
        value = JSON.parse(rawValue as string);
      } catch {
        value = [];
      }
    }

    // Parse boolean
    if (StepInputTypes[stepSlug] === 'boolean') {
      value = rawValue === 'true';
    }

    // Validate with Zod
    const schema = StepSchemas[stepSlug];
    const result = schema.safeParse(value);

    if (!result.success) {
      // In a real app, you'd return the error to display
      // For now, we'll just stop
      return;
    }

    // Save and get next step
    const { nextSlug: next } = await saveStepAndRedirect(stepSlug, value, nextSlug);

    // Redirect to next step
    redirect(`/questionnaire/${next === 'summary' ? 'summary' : `step/${next}`}`);
  }

  return (
    <>
      <ProgressBar current={currentStep} total={totalSteps} />

      <StepShell
        title={StepLabels[stepSlug]}
        description={StepDescriptions[stepSlug]}
      >
        <form action={handleSubmit} className="space-y-6">
          <StepInput
            name={stepSlug}
            type={StepInputTypes[stepSlug]}
            value={currentValue}
            options={StepOptions[stepSlug]}
            required={true}
          />

          <NavButtons
            backHref={backHref ?? undefined}
            nextLabel={nextSlug === 'summary' ? 'Review & Pricing' : 'Continue'}
            canGoBack={stepIndex > 0}
          />
        </form>
      </StepShell>
    </>
  );
}
