/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { iter } from "./iter";
import { object } from "./object";
import { isObject } from "./type-narrowing";

export type IgnoredClassNames = number | symbol | Function;
export type IClassName = string | string[] | Record<string, any> | undefined | null | false | IgnoredClassNames;

export function cssNames(...classNames: IClassName[]): string {
  const classNamesEnabled = new Map<string, boolean>();

  for (const className of classNames) {
    if (typeof className === "string") {
      classNamesEnabled.set(className, true);
    } else if (Array.isArray(className)) {
      for (const name of className) {
        classNamesEnabled.set(name, true);
      }
    } else if (isObject(className)) {
      for (const [name, value] of object.entries(className)) {
        classNamesEnabled.set(name, Boolean(value));
      }
    }
  }

  return iter.chain(classNamesEnabled.entries())
    .filter(([, isActive]) => isActive)
    .filterMap(([className]) => className.trim())
    .join(" ");
}
