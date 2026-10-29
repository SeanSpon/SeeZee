import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Websites, Automation & Technical Support",
  description:
    "Custom websites, web apps, business automation, and ongoing technical support from SeeZee Studios in Louisville, Kentucky.",
  path: "/services",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
