import { requireAdmin } from "@/lib/authz";
import MapClient from "@/components/admin/ceo/map/MapClient";

export const metadata = {
  title: "City Map | CEO",
  description: "Live pixel-art map of your AI fleet",
};

export default async function MapPage() {
  await requireAdmin();
  return <MapClient />;
}
