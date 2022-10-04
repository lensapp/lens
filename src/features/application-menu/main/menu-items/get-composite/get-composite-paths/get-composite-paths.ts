/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { flatMap } from "lodash/fp";
import type { Composite } from "../get-composite";

export const getCompositePaths = (
  composite: Composite<any>,
  previousPath: string[] = [],
): string[] => {
  const currentPath = [...previousPath, composite.id];

  const currentPathString = currentPath.join(".");

  return [
    currentPathString,

    ...pipeline(
      composite.children,

      flatMap((childComposite) =>
        getCompositePaths(childComposite, currentPath),
      ),
    ),
  ];
};
