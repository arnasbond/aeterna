import { MapPageShell } from "@/components/MapPageShell";

export const metadata = {
  title: "Parapijų žemėlapis | AETERNA",
  description: "Interaktyvus Lietuvos parapijų žemėlapis pagal seniūnijas.",
};

export default function MapPage() {
  return <MapPageShell />;
}
