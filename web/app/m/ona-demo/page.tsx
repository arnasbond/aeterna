import { MemorialProfile } from "@/components/MemorialProfile";
import { getDemoMemorialPublic } from "@/lib/memorial-demo-public";

export default function OnaDemoMemorialPage() {
  const memorial = getDemoMemorialPublic("ona-demo")!;
  return (
    <MemorialProfile memorial={memorial} slug="ona-demo" geo={memorial.geoLocation} />
  );
}
