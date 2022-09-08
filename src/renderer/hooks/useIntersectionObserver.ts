/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect, useState } from "react";

/**
 * Intersection Observer configuratiopn options.
 */
interface IntersectionObserverOptions {
  /**
   * If `true`, check for intersection only once. Will
   * disconnect the IntersectionObserver instance after
   * intersection.
   */
  triggerOnce?: boolean;

  /**
   * Number from 0 to 1 representing the percentage
   * of the element that needs to be visible to be
   * considered as visible. Can also be an array of
   * thresholds.
   */
  threshold?: number | number[];

  /**
   * Element that is used as the viewport for checking visibility
   * of the provided `ref` or `element`.
   */
  root?: Element;

  /**
   * Margin around the root. Can have values similar to
   * the CSS margin property.
   */
  rootMargin?: string;
}

function useIntersectionObserver(
  element: Element | null,
  {
    threshold = 0,
    rootMargin = "0%",
    root,
  }: IntersectionObserverOptions,
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(updateEntry, { threshold, root, rootMargin });

    observer.observe(element);

    return () => observer.disconnect();

  }, [element, threshold, root, rootMargin]);

  return entry;
}

export default useIntersectionObserver;
