/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ExecException, ExecFileException } from "child_process";
import type { IncomingMessage } from "http";

/**
 * Narrows `val` to include the property `key` (if true is returned)
 * @param val The object to be tested
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 */
export function hasOwnProperty<S extends object, K extends PropertyKey>(val: S, key: K): val is (S & { [key in K]: unknown }) {
  // this call syntax is for when `val` was created by `Object.create(null)`
  return Object.prototype.hasOwnProperty.call(val, key);
}

/**
 * Narrows `val` to a static type that includes fields of names in `keys`
 * @param val the value that we are trying to type narrow
 * @param keys the key names (must be literals for tsc to do any meaningful typing)
 */
export function hasOwnProperties<S extends object, K extends PropertyKey>(val: S, ...keys: K[]): val is (S & { [key in K]: unknown }) {
  return keys.every(key => hasOwnProperty(val, key));
}

/**
 * Narrows `val` to include the property `key` with type `V`
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 * @param isValid a function to check if the field is valid
 */
export function hasTypedProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & { [key in K]: V }) {
  return hasOwnProperty(val, key) && isValid(val[key]);
}

/**
 * Narrows `val` to include the property `key` with type `V | undefined` or doesn't contain it
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 * @param isValid a function to check if the field (when present) is valid
 */
export function hasOptionalTypedProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & { [key in K]?: V }) {
  if (hasOwnProperty(val, key)) {
    return typeof val[key] === "undefined" || isValid(val[key]);
  }

  return true;
}

/**
 * isRecord checks if `val` matches the signature `Record<T, V>` or `{ [label in T]: V }`
 * @param val The value to be checked
 * @param isKey a function for checking if the key is of the correct type
 * @param isValue a function for checking if a value is of the correct type
 */
export function isRecord<T extends PropertyKey, V>(val: unknown, isKey: (key: unknown) => key is T, isValue: (value: unknown) => value is V): val is Record<T, V> {
  return isObject(val) && Object.entries(val).every(([key, value]) => isKey(key) && isValue(value));
}

/**
 * isTypedArray checks if `val` is an array and all of its entries are of type `T`
 * @param val The value to be checked
 * @param isEntry a function for checking if an entry is the correct type
 */
export function isTypedArray<T>(val: unknown, isEntry: (entry: unknown) => entry is T): val is T[] {
  return Array.isArray(val) && val.every(isEntry);
}

/**
 * checks if val is of type string
 * @param val the value to be checked
 */
export function isString(val: unknown): val is string {
  return typeof val === "string";
}

/**
 * checks if val is of type Buffer
 * @param val the value to be checked
 */export function isBuffer(val: unknown): val is Buffer {
  return val instanceof Buffer;
}

/**
 * checks if val is of type number
 * @param val the value to be checked
 */
export function isNumber(val: unknown): val is number {
  return typeof val === "number";
}

/**
 * checks if val is of type boolean
 * @param val the value to be checked
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === "boolean";
}

/**
 * checks if val is of type object and isn't null
 * @param val the value to be checked
 */
export function isObject(val: unknown): val is object {
  return typeof val === "object" && val !== null;
}

/**
 * checks if `val` is defined, useful for filtering out undefined values in a strict manner
 */
export function isDefined<T>(val: T | undefined | null): val is T {
  return val != null;
}

/**
 * Checks if the value in the second position is non-nullable
 */
export function hasDefinedTupleValue<K, V>(pair: [K, V | undefined | null]): pair is [K, V] {
  return pair[1] != null;
}

/**
 * Creates a new predicate function (with the same predicate) from `fn`. Such
 * that it can be called with just the value to be tested.
 *
 * This is useful for when using `hasOptionalProperty` and `hasTypedProperty`
 * @param fn A typescript user predicate function to be bound
 * @param boundArgs the set of arguments to be passed to `fn` in the new function
 */
export function bindPredicate<FnArgs extends any[], T>(fn: (arg1: unknown, ...args: FnArgs) => arg1 is T, ...boundArgs: FnArgs): (arg1: unknown) => arg1 is T {
  return (arg1: unknown): arg1 is T => fn(arg1, ...boundArgs);
}

export function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return isObject(error)
    && hasOptionalTypedProperty(error, "code", isString)
    && hasOptionalTypedProperty(error, "path", isString)
    && hasOptionalTypedProperty(error, "syscall", isString)
    && hasOptionalTypedProperty(error, "errno", isNumber)
    && error instanceof Error;
}

export function isExecException(error: unknown): error is ExecException {
  return isObject(error)
    && hasOptionalTypedProperty(error, "cmd", isString)
    && hasOptionalTypedProperty(error, "killed", isBoolean)
    && hasOptionalTypedProperty(error, "signal", isString)
    && hasOptionalTypedProperty(error, "code", isNumber)
    && error instanceof Error;
}

export function isExecFileException(error: unknown): error is ExecFileException {
  return isExecException(error) && isErrnoException(error);
}

export type OutputFormat = "string" | "buffer";
export type ComputeOutputFormat<Format> = Format extends "string"
  ? string
  : Format extends "buffer"
    ? Buffer
    : string | Buffer;

export interface ChildProcessExecpetion<Format> extends ExecFileException {
  stderr: ComputeOutputFormat<Format>;
  stdout: ComputeOutputFormat<Format>;
}

const isStringOrBuffer = (val: unknown): val is string | Buffer => isString(val) || isBuffer(val);

export function isChildProcessError(error: unknown, format?: OutputFormat): error is ChildProcessExecpetion<typeof format> {
  if (!isExecFileException(error)) {
    return false;
  }

  if (format === "string") {
    return hasTypedProperty(error, "stderr", isString)
      && hasTypedProperty(error, "stdout", isString);
  } else if (format === "buffer") {
    return hasTypedProperty(error, "stderr", isBuffer)
      && hasTypedProperty(error, "stdout", isBuffer);
  } else {
    return hasTypedProperty(error, "stderr", isStringOrBuffer)
      && hasTypedProperty(error, "stdout", isStringOrBuffer);
  }
}

export interface RequestLikeError extends Error {
  statusCode?: number;
  failed?: boolean;
  timedOut?: boolean;
  error?: string;
  response?: IncomingMessage & { body?: any };
}

/**
 * A type guard for checking if the error is similar in shape to a request package error
 */
export function isRequestError(error: unknown): error is RequestLikeError {
  return isObject(error)
    && hasOptionalTypedProperty(error, "statusCode", isNumber)
    && hasOptionalTypedProperty(error, "failed", isBoolean)
    && hasOptionalTypedProperty(error, "timedOut", isBoolean)
    && hasOptionalTypedProperty(error, "error", isString)
    && hasOptionalTypedProperty(error, "response", isObject)
    && error instanceof Error;
}
