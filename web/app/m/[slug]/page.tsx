import { MemorialProfile } from "@/components/MemorialProfile";
import { MemorialPageClient } from "@/components/memorial/MemorialPageClient";
import { getDemoMemorialPublic } from "@/lib/memorial-demo-public";

type Props = { params: Promise<{ slug: string }> };

/** Demo profiliai — serverio HTML be API (veikia net jei /api/v1 neproxy). */
export default async function MemorialPage({ params }: Props) {
  const { slug } = await params;
  const demo = getDemoMemorialPublic(slug);

  if (demo) {
    return <MemorialProfile memorial={demo} slug={slug} geo={demo.geoLocation} />;
  }

  return <MemorialPageClient slug={slug} />;
}
