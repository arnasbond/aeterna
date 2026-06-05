"use client";

import { useEffect, useState } from "react";
import type { FamilyTreeNode } from "@/lib/api";

type Props = {
  nodes: FamilyTreeNode[];
  disabled?: boolean;
  onChange: (nodes: FamilyTreeNode[]) => void;
};

function emptyNode(): FamilyTreeNode {
  return { id: crypto.randomUUID(), name: "", relation: "", birthDate: null, deathDate: null, note: null };
}

export function FamilyTreeEditor({ nodes, disabled, onChange }: Props) {
  const [local, setLocal] = useState<FamilyTreeNode[]>(nodes.length ? nodes : []);

  useEffect(() => {
    setLocal(nodes);
  }, [nodes]);

  function update(idx: number, patch: Partial<FamilyTreeNode>) {
    const next = local.map((n, i) => (i === idx ? { ...n, ...patch } : n));
    setLocal(next);
    onChange(next);
  }

  function add() {
    const next = [...local, emptyNode()];
    setLocal(next);
    onChange(next);
  }

  function remove(idx: number) {
    const next = local.filter((_, i) => i !== idx);
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="ae-family-tree">
      {local.length === 0 && (
        <p className="ae-hint" style={{ marginTop: 0 }}>
          Pridėkite artimuosius — vardas, ryšys (pvz. sūnus, žmona) ir datos.
        </p>
      )}
      {local.map((node, idx) => (
        <div key={node.id} className="ae-card" style={{ padding: "0.75rem", marginBottom: "0.5rem" }}>
          <div className="ae-field">
            <label>Vardas ir pavardė</label>
            <input
              value={node.name}
              disabled={disabled}
              onChange={(e) => update(idx, { name: e.target.value })}
            />
          </div>
          <div className="ae-field">
            <label>Ryšys</label>
            <input
              value={node.relation}
              disabled={disabled}
              placeholder="pvz. sūnus, dukra, žmona"
              onChange={(e) => update(idx, { relation: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="ae-field">
              <label>Gimimo data</label>
              <input
                type="date"
                value={node.birthDate ?? ""}
                disabled={disabled}
                onChange={(e) => update(idx, { birthDate: e.target.value || null })}
              />
            </div>
            <div className="ae-field">
              <label>Mirties data</label>
              <input
                type="date"
                value={node.deathDate ?? ""}
                disabled={disabled}
                onChange={(e) => update(idx, { deathDate: e.target.value || null })}
              />
            </div>
          </div>
          <div className="ae-field">
            <label>Pastaba</label>
            <input
              value={node.note ?? ""}
              disabled={disabled}
              onChange={(e) => update(idx, { note: e.target.value || null })}
            />
          </div>
          {!disabled && (
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => remove(idx)}>
              Pašalinti
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button type="button" className="ae-btn ae-btn--outline ae-btn--wide" onClick={add}>
          + Pridėti giminaitį
        </button>
      )}
    </div>
  );
}
