import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Web Design & Development Portfolio",
  description:
    "Explore SeeZee Studios client websites and software projects, including A Vision For You, Frosty Sno-Balls, TaxFeeder, and clearly labeled UI prototypes.",
  path: "/projects",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
