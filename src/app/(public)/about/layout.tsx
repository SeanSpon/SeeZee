import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Meet the Studio",
  description:
    "Meet Sean McCulloch and Zach Robards, the people behind SeeZee Studios. A Louisville studio for websites, software, automation, and ongoing support.",
  path: "/about",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
