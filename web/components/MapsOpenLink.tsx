"use client";

import { handleMapsLinkClick } from "@/lib/open-maps";

type Props = {
  href: string;
  className?: string;
  title?: string;
  onAfterClick?: () => void;
  children: React.ReactNode;
};

/** Tikra nuoroda — naršyklėje veikia patikimiausiai (be preventDefault). */
export function MapsOpenLink({ href, className, title, onAfterClick, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      onClick={(e) => {
        handleMapsLinkClick(e);
        onAfterClick?.();
      }}
    >
      {children}
    </a>
  );
}
