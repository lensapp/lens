/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { iter } from "../../common/utils";

export type IgnoredClassNames = number | symbol | Function;

export type IClassName = string | string[] | IClassNameMap | undefined | null | false | IgnoredClassNames;
export type IClassNameMap = object;

export function cssNames(...classNames: IClassName[]): string {
  const classNamesEnabled = new Map<string, boolean>();

  for (const className of classNames) {
    if (typeof className === "string") {
      classNamesEnabled.set(className, true);
    } else if (Array.isArray(className)) {
      for (const name of className) {
        classNamesEnabled.set(name, true);
      }
    } else if (className && typeof className === "object") {
      for (const [name, value] of Object.entries(className)) {
        classNamesEnabled.set(name, Boolean(value));
      }
    }
  }

  return iter.pipeline(classNamesEnabled)
    .filter(([, isActive]) => !!isActive)
    .map(([className]) => className.trim())
    .join(" ");
}
