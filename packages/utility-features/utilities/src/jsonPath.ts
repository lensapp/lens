/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JSONPath } from "@astronautlabs/jsonpath";
import { TypedRegEx } from "typed-regex";

const slashDashSearch = /[/\\-]/g;
const pathByBareDots = /(?<=\w)\./;
const textBeforeFirstSquare = /^.*(?=\[)/g;
const backSlash = /\\/g;
const kubectlOptionPrefix = TypedRegEx("^\\$?\\.?(?<pathExpression>.*)");
const sliceVersion = /\[]/g;
const tripleDotName = /\.\.\.(?<trailing>.)/g;
const trailingDotDot = /\.\.$/;

/**
 * The GO package that kubectl and kubernetes uses for its JSONpath implementation has some
 * shorthand conveniences that are not part of the official spec. This function tries to convert
 * those shorthands to the official spec.
 *
 * Known shorthands:
 * - Leading `$` is optional (but implied)
 * - The string `/` can be used without a leading `\` escapement
 * - The string `\.` is used to denote the "value of '.'" and not "next key"
 * - The string `-` can be used while not in quotes
 * - `[]` as shorthand for `[0]`
 * - Remove `..` at the end of a path, we will just format it slightly differently
 * - Allow `...foo` as well as `..foo`
 */
export function convertKubectlJsonPathToNodeJsonPath(jsonPath: string) {
  const captures = kubectlOptionPrefix.captures(jsonPath);
  let start = "$";

  if (!captures) {
    return start;
  }

  let { pathExpression } = captures;

  if (pathExpression.match(slashDashSearch)) {
    const [first, ...rest] = pathExpression.split(pathByBareDots);

    pathExpression = `${convertToIndexNotation(first, true)}${rest.map(value => convertToIndexNotation(value)).join("")}`;
  }

  pathExpression = pathExpression.replace(trailingDotDot, "");
  pathExpression = pathExpression.replace(tripleDotName, "..$<trailing>");

  if (!pathExpression.startsWith("[")) {
    start += ".";
  }

  // strip '\' characters from the result
  return `${start}${pathExpression.replace(backSlash, "").replace(sliceVersion, "[0]")}`;
}

function convertToIndexNotation(key: string, firstItem = false) {
  if (key.match(slashDashSearch)) {
    if (key.includes("[")) { // handle cases where key contains [...]
      const keyToConvert = key.match(textBeforeFirstSquare); // get the text from the key before '['

      if (keyToConvert && keyToConvert[0].match(slashDashSearch)) { // check if that part contains illegal characters
        return key.replace(keyToConvert[0], `['${keyToConvert[0]}']`); // surround key with '[' and ']'
      } else {
        return `.${key}`; // otherwise return as is with leading '.'
      }
    }

    return `['${key}']`;
  } else { // no illegal characters found, do not touch
    const prefix = firstItem ? "" : ".";

    return `${prefix}${key}`;
  }
}

export function formatJSONValue(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(formatJSONValue).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * This function is a safer version of `JSONPath.value(obj, path)` with untrusted jsonpath strings
 */
export function safeJSONPathValue(obj: object, path: string): unknown {
  try {
    const parsedPath = JSONPath.parse(convertKubectlJsonPathToNodeJsonPath(path));
    const isSlice = parsedPath.some((exp: any) => exp.expression.type === "slice" || exp.expression.type === "wildcard");
    const value = JSONPath.query(obj, JSONPath.stringify(parsedPath), isSlice ? Infinity : 1);

    if (isSlice) {
      return value;
    }

    return value[0];
  } catch (error) {
    // something failed
    console.warn("[JSON-PATH]: failed to parse jsonpath", error);

    return undefined;
  }
}
