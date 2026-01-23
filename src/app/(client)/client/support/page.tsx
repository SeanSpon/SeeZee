export default function ClientSupportPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Support</h2>
        <p className="text-slate-400 mt-1">Get help and find answers to common questions</p>
      </div>

      {/* Contact Support */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Contact Support</h3>
        <p className="text-slate-400 mb-4">
          Need help? Our team is here to assist you. Send us a message and we'll get back to you as soon as possible.
        </p>
        <a
          href="mailto:support@seezee.studio"
          className="inline-block px-6 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl transition-all font-medium"
        >
          Email Support
        </a>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-white font-medium cursor-pointer">
              How do I track my project progress?
            </summary>
            <p className="text-slate-400 mt-3">
              Navigate to the Projects page to see an overview of all your projects. Click on any project to view detailed progress, tasks, and timeline.
            </p>
          </details>

          <details className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <summary className="text-white font-medium cursor-pointer">
              How do I pay invoices?
            </summary>
            <p className="text-slate-400 mt-3">
              Go to the Invoices page and click on any invoice to view payment details. You'll receive a payment link via email when an invoice is issued.
            </p>
          </details>

          <details className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <summary className="text-white font-medium cursor-pointer">
              Can I request changes to my project?
            </summary>
            <p className="text-slate-400 mt-3">
              Yes! Use the Requests page to submit change requests or new feature requests. Our team will review and respond to your request.
            </p>
          </details>

          <details className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <summary className="text-white font-medium cursor-pointer">
              How do I communicate with my team?
            </summary>
            <p className="text-slate-400 mt-3">
              Use the Messages page to communicate directly with your project team. You can also comment on specific tasks and milestones.
            </p>
          </details>

          <details className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <summary className="text-white font-medium cursor-pointer">
              Where can I find project files?
            </summary>
            <p className="text-slate-400 mt-3">
              All project deliverables and shared files are available in the Files & Assets page. You can download files or upload your own for sharing with the team.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
