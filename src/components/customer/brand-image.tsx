"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrandImage({
  src,
  alt,
  className,
  fallbackSrc,
  fallbackLabel,
  width = 480,
  height = 480,
  sizes,
  priority = false,
  fit = "cover"
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fallbackLabel?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);
  const activeSrc = failed && fallbackSrc ? fallbackSrc : src;

  if (failed && !fallbackSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-50 to-teal-100",
          className
        )}
      >
        <span className="text-sm font-semibold text-primary/70">{fallbackLabel ?? alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={activeSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

export function BrandBackground({
  src,
  alt,
  className,
  overlayClassName,
  fallbackClassName,
  sizes = "100vw",
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  fallbackClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {failed ? (
        <div
          className={cn(
            "h-full w-full bg-gradient-to-br from-cyan-100 via-sky-50 to-teal-100",
            fallbackClassName
          )}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
          priority={priority}
        />
      )}
      {overlayClassName ? <div className={cn("absolute inset-0", overlayClassName)} /> : null}
    </div>
  );
}
