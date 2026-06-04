import { MemorialProfile } from "@/components/MemorialProfile";
import { getDemoMemorialPublic } from "@/lib/memorial-demo-public";

export default function VardenisMemorialPage() {
  const memorial = getDemoMemorialPublic("vardenis-pavardenis")!;
  return (
    <MemorialProfile
      memorial={memorial}
      slug="vardenis-pavardenis"
      geo={memorial.geoLocation}
    />
  );
}
