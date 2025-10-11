import { createRequest } from "./actions";
import { auth } from "@/auth";

const SERVICE_OPTIONS = [
  { value: "WEB_APP", label: "Web Application" },
  { value: "WEBSITE", label: "Website" },
  { value: "ECOMMERCE", label: "E-Commerce" },
  { value: "AI_DATA", label: "AI & Data" },
  { value: "MOBILE", label: "Mobile App" },
  { value: "BRANDING", label: "Branding" },
  { value: "OTHER", label: "Other" },
] as const;

const BUDGET_OPTIONS = [
  { value: "UNKNOWN", label: "Not sure yet" },
  { value: "MICRO", label: "$1,000 - $5,000" },
  { value: "SMALL", label: "$5,000 - $15,000" },
  { value: "MEDIUM", label: "$15,000 - $50,000" },
  { value: "LARGE", label: "$50,000 - $150,000" },
  { value: "ENTERPRISE", label: "$150,000+" },
] as const;

export default async function StartProject() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Start Your Project
          </h1>
          <p className="text-xl text-gray-300">
            Tell us about your vision and we'll bring it to life
          </p>
        </div>

        {/* Form */}
        <form
          action={createRequest}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/20"
        >
          <div className="space-y-6">
            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="e.g., E-commerce platform for artisan goods"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={5}
                placeholder="Describe your project goals, target audience, key features..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="contactEmail"
                id="contactEmail"
                required
                defaultValue={session?.user?.email || ""}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-200 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="company"
                id="company"
                placeholder="Your company"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Services Needed * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_OPTIONS.map((service) => (
                  <label
                    key={service.value}
                    className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="services"
                      value={service.value}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-gray-200">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-200 mb-2">
                Budget Range
              </label>
              <select
                name="budget"
                id="budget"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-200 mb-2">
                Desired Timeline
              </label>
              <input
                type="text"
                name="timeline"
                id="timeline"
                placeholder="e.g., 2-3 months, ASAP, Q1 2026"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Resources URL */}
            <div>
              <label htmlFor="resourcesUrl" className="block text-sm font-medium text-gray-200 mb-2">
                Reference Materials (Optional)
              </label>
              <input
                type="url"
                name="resourcesUrl"
                id="resourcesUrl"
                placeholder="https://notion.so/... or Google Drive link"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-400">
                Link to any design mocks, docs, or inspiration
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Submit Project Request
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              * Required fields
            </p>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>🔒 Your information is secure and confidential</p>
          <p className="mt-2">We typically respond within 24 hours</p>
        </div>
      </div>
    </div>
  );
}
