/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite/get-composite";

const _findComposite = <T>(currentLeftIds: string[], currentId: string, currentRightIds: string[], composite: Composite<T>): Composite<T> => {
  const [nextId, ...nextRightIds] = currentRightIds;
  const nextLeftIds = [...currentLeftIds, currentId];

  if (currentRightIds.length === 0 && composite.id === currentId) {
    return composite;
  }

  const foundChildComposite = composite.children.find((child) => child.id === nextId);

  if (foundChildComposite) {
    return _findComposite(nextLeftIds, nextId, nextRightIds, foundChildComposite);
  }

  const fullPathString = [...currentLeftIds, currentId, ...currentRightIds].join(" -> ");

  throw new Error(`Tried to find '${fullPathString}' from a composite, but found nothing.

Node '${[...currentLeftIds, composite.id].join(" -> ")}' had only following children:
${composite.children.map((child) => child.id).join("\n")}`);
};

export const findComposite =
  (...path: string[]) =>
  <T>(composite: Composite<T>): Composite<T> => {
    const [currentId, ...rightIds] = path;
    const leftIds: string[] = [];

    return _findComposite(leftIds, currentId, rightIds, composite);
  };
