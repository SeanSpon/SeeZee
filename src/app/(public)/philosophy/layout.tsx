import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Our Approach",
  description:
    "How SeeZee Studios approaches web design and development: clear goals, understandable experiences, and practical support after launch.",
  path: "/philosophy",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
