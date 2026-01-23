/**
 * Pipeline Layout - Simplified wrapper
 * Sub-pages (leads, projects, invoices) are still accessible but tabs are removed
 * for a cleaner main pipeline view
 */

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
