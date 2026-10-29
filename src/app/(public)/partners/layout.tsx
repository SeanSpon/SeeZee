import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Community & Partners",
  description:
    "SeeZee Studios works with businesses, nonprofits, and community organizations in Louisville on thoughtful websites and useful digital systems.",
  path: "/partners",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
