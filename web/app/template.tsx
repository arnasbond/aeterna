"use client";

import { useEffect, useState } from "react";

/** Smooth page enter on route change — Hercules luxury transition */
export default function Template({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [children]);

  return (
    <div className={`hercules-page-enter ${visible ? "hercules-page-enter--active" : ""}`}>{children}</div>
  );
}
