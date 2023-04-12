/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SingleOrMany } from "./types";
export interface Disposer {
    (): void;
}
export interface Disposable {
    dispose(): void;
}
export interface ExtendableDisposer extends Disposer {
    push(...values: (Disposer | ExtendableDisposer | Disposable)[]): void;
}
export declare function disposer(...items: SingleOrMany<Disposer | Disposable | undefined | null>[]): ExtendableDisposer;
