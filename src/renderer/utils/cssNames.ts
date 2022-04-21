/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for combining css classes inside components

export type IgnoredClassNames = number | symbol | Function;

export type IClassName = string | string[] | IClassNameMap | undefined | null | false | IgnoredClassNames;
export type IClassNameMap = Record<string, unknown>;

export function cssNames(...classNames: IClassName[]): string {
  const classNamesEnabled: IClassNameMap = {};

  for (const className of classNames) {
    if (typeof className === "string") {
      classNamesEnabled[className] = true;
    } else if (Array.isArray(className)) {
      for (const name of className) {
        classNamesEnabled[name] = true;
      }
    } else if (className && typeof className === "object") {
      Object.assign(classNamesEnabled, className);
    }
  }

  return Object.entries(classNamesEnabled)
    .filter(([, isActive]) => !!isActive)
    .map(([className]) => className.trim())
    .join(" ");
}
