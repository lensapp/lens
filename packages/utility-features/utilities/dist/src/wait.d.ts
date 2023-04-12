/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import type { Disposer } from "./disposer";
export declare function waitUntilDefined<T>(getter: (() => T | null | undefined) | IComputedValue<T | null | undefined>, opts?: {
    timeout?: number;
}): Promise<T>;
export declare function onceDefined<T>(getter: () => T | null | undefined, action: (val: T) => void): Disposer;
