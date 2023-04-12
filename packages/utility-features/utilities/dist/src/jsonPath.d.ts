/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
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
export declare function convertKubectlJsonPathToNodeJsonPath(jsonPath: string): string;
export declare function formatJSONValue(value: unknown): string;
/**
 * This function is a safer version of `JSONPath.value(obj, path)` with untrusted jsonpath strings
 *
 * This function will also stringify the value retreived from the object
 */
export declare function safeJSONPathValue(obj: object, path: string): unknown;
