"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDialogContext } from "@/lib/dialog";
import { motion } from "framer-motion";
import {
  Check,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  CreditCard,
} from "lucide-react";
import { SubscriptionPlan } from "@/lib/subscriptionPlans";
import Link from "next/link";

interface CurrentSubscription {
  id: string;
  projectId: string;
  projectName: string;
  planName: string;
  priceId: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface UpgradeClientProps {
  plans: SubscriptionPlan[];
  currentSubscriptions: CurrentSubscription[];
  projects: Project[];
}

export function UpgradeClient({ plans, currentSubscriptions, projects }: UpgradeClientProps) {
  const dialog = useDialogContext();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan'); // Get plan from URL parameter
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select plan based on URL parameter
  useEffect(() => {
    if (planParam && plans.length > 0) {
      const planFromUrl = plans.find(p => p.id === planParam);
      if (planFromUrl) {
        setSelectedPlan(planFromUrl);
      } else {
        setSelectedPlan(plans[0] || null);
      }
    } else {
      setSelectedPlan(plans[0] || null);
    }
  }, [planParam, plans]);

  const handleUpgrade = async () => {
    if (!selectedPlan || !selectedProject) return;

    // Check if there's an existing subscription for this project
    const existingSubscription = currentSubscriptions.find(
      (sub) => sub.projectId === selectedProject
    );

    // If there's an existing subscription, ask if they want to switch
    if (existingSubscription) {
      const confirmMessage = `You currently have an active subscription (${existingSubscription.planName}) for this project. Switching to ${selectedPlan.displayName} will cancel your current subscription and start a new one. You'll be charged the prorated amount for the new plan. Continue?`;

      const confirmed = await dialog.confirm(confirmMessage, {
        title: "Switch Subscription",
        variant: "warning",
        confirmText: "Yes, Switch",
        cancelText: "Cancel",
      });

      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/client/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          projectId: selectedProject,
          priceId: selectedPlan.stripePriceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      await dialog.alert(error instanceof Error ? error.message : "Failed to start upgrade process", {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const isCurrentPlan = !!(selectedPlan && currentSubscriptions.some(
    (sub) => sub.planName === selectedPlan.name
  ));

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Complete Your Subscription</h1>
              <p className="text-gray-400">
                Select your project and confirm your maintenance plan
              </p>
            </div>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isCurrent = currentSubscriptions.some(sub => sub.planName === plan.name);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPlan(plan)}
                className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-cyan-500 border-cyan-500' 
                    : 'border-white/10 hover:border-cyan-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded">
                      Current Plan
                    </span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 left-4">
                    <Check className="w-6 h-6 text-cyan-400" />
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.displayName.replace(' Plan', '')}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${(plan.price / 100).toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      /{plan.billingCycle === 'quarterly' ? 'quarter' : 'year'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${((plan.price / 100) / (plan.billingCycle === 'quarterly' ? 3 : 12)).toFixed(2)}/month
                    {plan.billingCycle === 'annual' && ' • Save 15%'}
                  </p>
                </div>

                <div className="space-y-2">
                  {plan.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-300">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <p className="text-xs text-gray-400 italic">+{plan.features.length - 6} more features</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Project Selection & Upgrade Button */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Select Project for {selectedPlan.displayName}
            </h3>

            {projects.length > 0 ? (
              <div className="space-y-3 mb-6">
                {projects.map((project) => {
                  const projectSub = currentSubscriptions.find(
                    (sub) => sub.projectId === project.id
                  );
                  const hasSelectedPlan = projectSub && selectedPlan && projectSub.planName === selectedPlan.name;
                  
                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedProject === project.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : hasSelectedPlan
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{project.name}</p>
                            {hasSelectedPlan && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                Has {selectedPlan.displayName}
                              </span>
                            )}
                          </div>
                          {projectSub && (
                            <p className="text-xs text-gray-400 mt-1">
                              Current: {projectSub.planName}
                              {hasSelectedPlan && " • Already subscribed to this plan"}
                            </p>
                          )}
                          {!projectSub && (
                            <p className="text-xs text-gray-500 mt-1">
                              No active subscription
                            </p>
                          )}
                        </div>
                        {selectedProject === project.id && (
                          <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  No projects found. You need to have a project to subscribe to a maintenance plan.
                </p>
              </div>
            )}

            {/* Warning if selected project already has this plan */}
            {selectedProject && selectedPlan && (() => {
              const projectSub = currentSubscriptions.find(
                (sub) => sub.projectId === selectedProject
              );
              const hasExactPlan = projectSub && projectSub.planName === selectedPlan.name;
              
              if (hasExactPlan) {
                return (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400 font-medium mb-1">
                      ✓ This project already has {selectedPlan.displayName}
                    </p>
                    <p className="text-xs text-gray-400">
                      You cannot purchase the same plan twice. To change plans, select a different subscription type above.
                    </p>
                  </div>
                );
              }
              
              if (projectSub) {
                return (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400 font-medium mb-1">
                      Switching from {projectSub.planName} to {selectedPlan.displayName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Your current subscription will be canceled and replaced with the new plan. You'll be charged a prorated amount.
                    </p>
                  </div>
                );
              }
              
              return null;
            })()}

            <div className="flex items-center gap-4">
              <button
                onClick={handleUpgrade}
                disabled={!selectedProject || isLoading || isCurrentPlan}
                className={`flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {isCurrentPlan ? 'Already Subscribed' : `Subscribe to ${selectedPlan.displayName}`}
                    {!isCurrentPlan && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
              <Link
                href="/client/subscriptions"
                className="py-3 px-6 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-2">About Our Maintenance Plans</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>
                  • Your maintenance plan activates immediately upon payment
                </li>
                <li>
                  • Choose quarterly ($2,000/quarter) or annual ($6,800/year - save 15%)
                </li>
                <li>
                  • Includes 30 support hours per quarter with unlimited change requests
                </li>
                <li>
                  • All plans include managed hosting, SSL certificates, and priority support
                </li>
                <li>
                  • No long-term commitment - cancel anytime before the next billing period
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

