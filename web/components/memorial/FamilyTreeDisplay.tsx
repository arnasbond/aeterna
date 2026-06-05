import type { FamilyTreeNode } from "@/lib/api";

type Props = {
  nodes: FamilyTreeNode[];
  memorialName: string;
};

function yearLabel(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return String(new Date(d).getFullYear());
  } catch {
    return d.slice(0, 4);
  }
}

export function FamilyTreeDisplay({ nodes, memorialName }: Props) {
  if (!nodes.length) return null;

  return (
    <section className="ch-section ae-card" style={{ padding: "1.25rem", marginTop: "1.5rem" }}>
      <h2 className="chronicle-serif" style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>
        Giminės medis
      </h2>
      <p className="ae-hint" style={{ marginTop: 0, marginBottom: "1rem" }}>
        Artimieji ir ryšiai su {memorialName}.
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.65rem" }}>
        {nodes.map((n) => {
          const years = [yearLabel(n.birthDate), yearLabel(n.deathDate)].filter(Boolean).join(" – ");
          return (
            <li
              key={n.id}
              style={{
                borderLeft: "3px solid var(--ae-primary, #4a2f7a)",
                paddingLeft: "0.75rem",
              }}
            >
              <strong>{n.name}</strong>
              {n.relation && (
                <span style={{ color: "var(--ch-muted)", marginLeft: "0.35rem" }}>({n.relation})</span>
              )}
              {years && <div style={{ fontSize: "0.9rem", color: "var(--ch-muted)" }}>{years}</div>}
              {n.note && <p style={{ margin: "0.25rem 0 0", fontSize: "0.92rem" }}>{n.note}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
