/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite";

export const getCompositeNormalization = <T>(composite: Composite<T>) => {
  const _normalizeComposite = <T>(
    composite: Composite<T>,
    previousPath: string[] = [],
  ): (readonly [path: string, composite: Composite<T>])[] => {
    const currentPath = [...previousPath, composite.id];

    const pathAndCompositeTuple = [currentPath.join("."), composite] as const;

    return [
      pathAndCompositeTuple,

      ...composite.children.flatMap((x) => _normalizeComposite(x, currentPath)),
    ];
  };

  return _normalizeComposite(composite);
};
