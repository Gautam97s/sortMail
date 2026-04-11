"use client";

import { Suspense, ReactNode } from "react";

/**
 * Wraps components that use useSearchParams() in a Suspense boundary.
 * This is required in Next.js 14 for static generation of pages using client-side hooks.
 * @param children - The component that uses useSearchParams()
 * @param fallback - Optional loading UI
 */
export function SearchParamsWrapper({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <div className="w-full h-screen" />}>
      {children}
    </Suspense>
  );
}
