/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for combining css classes inside components

export type IClassName = string | string[] | IClassNameMap | undefined | false;
export type IClassNameMap = Record<string, any>;

export function cssNames(...args: IClassName[]): string {
  const map: IClassNameMap = {};

  args.forEach(className => {
    if (typeof className === "string" || Array.isArray(className)) {
      [className].flat().forEach(name => map[name] = true);
    }
    else {
      Object.assign(map, className);
    }
  });

  return Object.entries(map)
    .filter(([, isActive]) => !!isActive)
    .map(([className]) => className.trim())
    .join(" ");
}
