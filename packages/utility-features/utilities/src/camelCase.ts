/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Convert object's keys to camelCase format
import { camelCase } from "lodash";
import type { SingleOrMany } from "./types";
import { isObject, isString } from "./type-narrowing";
import { object } from "./object";

export function toCamelCase<T extends Record<string, unknown>[]>(obj: T): T;
export function toCamelCase<T extends Record<string, unknown>>(obj: T): T;

export function toCamelCase(obj: SingleOrMany<Record<string, unknown> | unknown>): SingleOrMany<Record<string, unknown> | unknown> {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  if (isObject(obj)) {
    return object.fromEntries(
      object.entries(obj)
        .filter((pair): pair is [string, unknown] => isString(pair[0]))
        .map(([key, value]) => [camelCase(key), isObject(value) ? toCamelCase(value) : value]),
    );
  }

  return obj;
}
