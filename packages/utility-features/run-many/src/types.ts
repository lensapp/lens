/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Injectable } from "@ogre-tools/injectable";
import type { SingleOrMany } from "@k8slens/utilities";

export type Run<Param> = (parameter: Param) => Promise<void> | void;

export interface Runnable<T = void> {
  id?: never;
  run: Run<T>;
  readonly runAfter?: SingleOrMany<Injectable<Runnable<T>, Runnable<T>, void>>;
}

export interface RunnableWithId<T> {
  run: Run<T>;
  readonly id: string;
  readonly runAfter: RunnableWithId<T>[];
}

export interface RunnableSync<T = void> {
  id?: never;
  run: RunSync<T>;
  runAfter?: SingleOrMany<Injectable<RunnableSync<T>, RunnableSync<T>, void>>;
}

export interface RunnableSyncWithId<T> {
  run: RunSync<T>;
  readonly id: string;
  readonly runAfter: RunnableSyncWithId<T>[];
}

/**
 * NOTE: this is the worse of two evils. This makes sure that `RunnableSync` always is sync.
 * If the return type is `void` instead then async functions (those return `Promise<T>`) can
 * coerce to it.
 */
export type RunSync<Param> = (parameter: Param) => undefined;
