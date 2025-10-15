import { redirect } from 'next/navigation';
import { StepSlugs } from '@/lib/steps';

export default function QuestionnairePage() {
  // Redirect to first step
  redirect(`/questionnaire/step/${StepSlugs[0]}`);
}
