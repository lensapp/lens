/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export interface ObservableCrate<T> {
    get(): T;
    set(value: T): void;
}
export interface ObservableCrateFactory {
    <T>(initialValue: T, transitionHandlers?: ObservableCrateTransitionHandlers<T>): ObservableCrate<T>;
}
export interface ObservableCrateTransitionHandler<T> {
    from: T;
    to: T;
    onTransition: () => void;
}
export type ObservableCrateTransitionHandlers<T> = ObservableCrateTransitionHandler<T>[];
export declare const observableCrate: ObservableCrateFactory;
