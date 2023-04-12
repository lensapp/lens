/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ExecException, ExecFileException } from "child_process";
import type { IncomingMessage } from "http";
/**
 * Narrows `val` to include the property `key` (if true is returned)
 * @param val The object to be tested
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 */
export declare function hasOwnProperty<S extends object, K extends PropertyKey>(val: S, key: K): val is (S & {
    [key in K]: unknown;
});
/**
 * Narrows `val` to a static type that includes fields of names in `keys`
 * @param val the value that we are trying to type narrow
 * @param keys the key names (must be literals for tsc to do any meaningful typing)
 */
export declare function hasOwnProperties<S extends object, K extends PropertyKey>(val: S, ...keys: K[]): val is (S & {
    [key in K]: unknown;
});
/**
 * Narrows `val` to include the property `key` with type `V`
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 * @param isValid a function to check if the field is valid
 */
export declare function hasTypedProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & {
    [key in K]: V;
});
/**
 * Narrows `val` to include the property `key` with type string
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 */
export declare function hasStringProperty<S extends object, K extends PropertyKey>(val: S, key: K): val is (S & {
    [key in K]: string;
});
/**
 * Narrows `val` to include the property `key` with type `V | undefined` or doesn't contain it
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any meaningful typing)
 * @param isValid a function to check if the field (when present) is valid
 */
export declare function hasOptionalTypedProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & {
    [key in K]?: V;
});
/**
 * isRecord checks if `val` matches the signature `Record<T, V>` or `{ [label in T]: V }`
 * @param val The value to be checked
 * @param isKey a function for checking if the key is of the correct type
 * @param isValue a function for checking if a value is of the correct type
 */
export declare function isRecord<T extends PropertyKey, V>(val: unknown, isKey: (key: unknown) => key is T, isValue: (value: unknown) => value is V): val is Record<T, V>;
/**
 * isTypedArray checks if `val` is an array and all of its entries are of type `T`
 * @param val The value to be checked
 * @param isEntry a function for checking if an entry is the correct type
 */
export declare function isTypedArray<T>(val: unknown, isEntry: (entry: unknown) => entry is T): val is T[];
/**
 * checks if val is of type string
 * @param val the value to be checked
 */
export declare function isString(val: unknown): val is string;
/**
 * checks if val is of type Buffer
 * @param val the value to be checked
 */ export declare function isBuffer(val: unknown): val is Buffer;
/**
 * checks if val is of type number
 * @param val the value to be checked
 */
export declare function isNumber(val: unknown): val is number;
/**
 * checks if val is of type boolean
 * @param val the value to be checked
 */
export declare function isBoolean(val: unknown): val is boolean;
/**
 * checks if val is of type object and isn't null
 * @param val the value to be checked
 */
export declare function isObject(val: unknown): val is Record<string | symbol | number, unknown>;
/**
 * checks if `val` is defined, useful for filtering out undefined values in a strict manner
 */
export declare function isDefined<T>(val: T | undefined | null): val is T;
export declare function isFunction(val: unknown): val is (...args: unknown[]) => unknown;
/**
 * Checks if the value in the second position is non-nullable
 */
export declare function hasDefinedTupleValue<K, V>(pair: readonly [K, V | undefined | null]): pair is [K, V];
/**
 * Creates a new predicate function (with the same predicate) from `fn`. Such
 * that it can be called with just the value to be tested.
 *
 * This is useful for when using `hasOptionalProperty` and `hasTypedProperty`
 * @param fn A typescript user predicate function to be bound
 * @param boundArgs the set of arguments to be passed to `fn` in the new function
 */
export declare function bindPredicate<FnArgs extends any[], T>(fn: (arg1: unknown, ...args: FnArgs) => arg1 is T, ...boundArgs: FnArgs): (arg1: unknown) => arg1 is T;
export declare function hasDefiniteField<Field extends keyof T, T>(field: Field): (val: T) => val is T & {
    [f in Field]-?: NonNullable<T[Field]>;
};
export declare function isPromiseLike(res: unknown): res is (Promise<unknown> | {
    then: (fn: (val: unknown) => any) => Promise<unknown>;
});
export declare function isPromiseSettledRejected<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult;
export declare function isPromiseSettledFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T>;
export declare function isErrnoException(error: unknown): error is NodeJS.ErrnoException;
export declare function isExecException(error: unknown): error is ExecException;
export declare function isExecFileException(error: unknown): error is ExecFileException;
export type OutputFormat = "string" | "buffer";
export type ComputeOutputFormat<Format> = Format extends "string" ? string : Format extends "buffer" ? Buffer : string | Buffer;
export interface ChildProcessExecpetion<Format> extends ExecFileException {
    stderr: ComputeOutputFormat<Format>;
    stdout: ComputeOutputFormat<Format>;
}
export declare function isChildProcessError(error: unknown, format?: OutputFormat): error is ChildProcessExecpetion<typeof format>;
export interface RequestLikeError extends Error {
    statusCode?: number;
    failed?: boolean;
    timedOut?: boolean;
    error?: string;
    response?: IncomingMessage & {
        body?: any;
    };
}
/**
 * A type guard for checking if the error is similar in shape to a request package error
 */
export declare function isRequestError(error: unknown): error is RequestLikeError;
