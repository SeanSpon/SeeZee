import { redirect } from 'next/navigation';

/**
 * Questionnaire route - Redirects to /start
 * Primary questionnaire route is now /start
 */
export default function QuestionnairePage() {
  redirect("/start");
}
