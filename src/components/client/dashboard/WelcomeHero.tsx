'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiArrowRight, 
  FiPlus, 
  FiCalendar,
  FiClock,
  FiSun,
  FiMoon,
  FiSunset,
} from 'react-icons/fi';

interface WelcomeHeroProps {
  userName: string;
  hasActiveProjects: boolean;
  pendingTasks?: number;
  nextMeeting?: {
    title: string;
    time: string;
    date: string;
  };
  hoursRemaining?: number;
  isUnlimited?: boolean;
}

function getGreeting(): { text: string; icon: typeof FiSun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: FiSun };
  if (hour < 17) return { text: 'Good afternoon', icon: FiSunset };
  return { text: 'Good evening', icon: FiMoon };
}

function getMotivationalMessage(hasActiveProjects: boolean, pendingTasks?: number): string {
  if (!hasActiveProjects) {
    return "Ready to start something amazing? Let's create your first project.";
  }
  if (pendingTasks && pendingTasks > 0) {
    return `You have ${pendingTasks} pending ${pendingTasks === 1 ? 'task' : 'tasks'} to complete.`;
  }
  return "Here's an overview of your projects and activity.";
}

export default function WelcomeHero({
  userName,
  hasActiveProjects,
  pendingTasks,
  nextMeeting,
  hoursRemaining,
  isUnlimited,
}: WelcomeHeroProps) {
  const { text: greetingText, icon: GreetingIcon } = getGreeting();
  const motivationalMessage = getMotivationalMessage(hasActiveProjects, pendingTasks);
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#0a1128] rounded-xl border border-white/10 p-8"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left side - Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <GreetingIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">{greetingText}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
              Welcome back, {firstName}!
            </h1>
            <p className="text-slate-400 max-w-xl">{motivationalMessage}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {hoursRemaining !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <FiClock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">
                    {isUnlimited ? (
                      <span className="text-cyan-400 font-semibold">Unlimited hours</span>
                    ) : (
                      <>
                        <span className="text-cyan-400 font-semibold">{hoursRemaining}</span>
                        {' hours remaining'}
                      </>
                    )}
                  </span>
                </div>
              )}
              
              {nextMeeting && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <FiCalendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">
                    Next meeting: <span className="text-purple-400 font-semibold">{nextMeeting.date}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/client/requests/new"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ef4444] text-white rounded-xl font-semibold shadow-lg shadow-[#ef4444]/20 hover:bg-[#dc2626] transition-all"
              >
                <FiPlus className="w-5 h-5" />
                New Request
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/client/projects"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white rounded-xl font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                View Projects
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
