"use client";

import { useState } from "react";

export function CollapsibleLink({
  label,
  children,
  defaultOpen = false
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        className="focus-ring text-sm font-semibold text-primary hover:underline"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Hide" : label}
      </button>
      {open ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
