import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Start a Project",
  description:
    "Tell SeeZee Studios about your website, custom app, or technology project. Contact our Louisville studio to discuss your goals and next steps.",
  path: "/contact",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
