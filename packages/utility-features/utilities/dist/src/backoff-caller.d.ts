/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "./result";
/**
 * @param error The error that resulted in the failure
 * @param attempt The 1-index attempt count
 */
export type OnIntermediateError<E> = (error: E, attempt: number) => void;
export interface BackoffCallerOptions<E> {
    /**
     * Called when an attempt fails
     */
    onIntermediateError?: OnIntermediateError<E>;
    /**
     * @default 5
     */
    maxAttempts?: number;
    /**
     * In milliseconds
     * @default 1000
     */
    initialTimeout?: number;
    /**
     * @default 2
     */
    scaleFactor?: number;
}
/**
 * Calls `fn` once and then again (with exponential delay between each attempt) up to `options.maxAttempts` times.
 * @param fn The function to repeatedly attempt
 * @returns The first success or the last failure
 */
export declare const backoffCaller: <T, E>(fn: () => AsyncResult<T, E>, options?: BackoffCallerOptions<E> | undefined) => AsyncResult<T, E>;
