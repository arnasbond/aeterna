"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { navigateToSectionHref } from "@/lib/app-section-nav";

type SectionNavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Section/menu link that lands on the correct page or home anchor. */
export function SectionNavLink({ href, onClick, ...props }: SectionNavLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigateToSectionHref(href, router);
      }}
    />
  );
}
