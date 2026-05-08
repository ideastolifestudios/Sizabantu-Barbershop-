"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Intersection Observer hook for lazy loading components.
 * Returns [ref, isVisible] — attach ref to the container element.
 *
 * @example
 * const [ref, isVisible] = useLazyLoad();
 * return <div ref={ref}>{isVisible && <HeavyComponent />}</div>;
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { rootMargin: "200px", threshold: 0.01, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
}

/**
 * Hook that returns true once the component has mounted on the client.
 * Useful for preventing SSR hydration mismatches on client-only components.
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Debounce hook — delays calling a function until after wait ms have passed.
 */
export function useDebounce<T>(value: T, wait = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), wait);
    return () => clearTimeout(timer);
  }, [value, wait]);
  return debounced;
}

/**
 * Format a ZAR price from cents to display string.
 * e.g. 5000 → "R50"
 */
export function formatPrice(cents: number): string {
  return `R${Math.round(cents / 100)}`;
}

/**
 * Format a relative time string.
 * e.g. "2 minutes ago", "just now"
 */
export function formatRelativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

/**
 * Preload critical images to avoid layout shift.
 * Call in a useEffect on the root layout.
 */
export function preloadImage(src: string): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}
