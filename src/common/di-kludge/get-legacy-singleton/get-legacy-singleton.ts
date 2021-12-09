/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getDiKludge } from "../di-kludge";

type Awaited<TMaybePromise> = TMaybePromise extends PromiseLike<infer TValue>
  ? TValue
  : TMaybePromise;

export const getLegacySingleton = <
  TInjectable extends Injectable<
    TInstance,
    TDependencies,
    TInstantiationParameter
  >,
  TInstance,
  TDependencies extends object,
  TInstantiationParameter,
  TMaybePromiseInstance = ReturnType<TInjectable["instantiate"]>,
>(
    injectableKey: TInjectable,
  ) => ({
    createInstance: (): TMaybePromiseInstance extends PromiseLike<any>
    ? Awaited<TMaybePromiseInstance>
    : TMaybePromiseInstance => {
      const di = getDiKludge();

      return di.inject(injectableKey);
    },

    getInstance: (): TMaybePromiseInstance extends PromiseLike<any>
    ? Awaited<TMaybePromiseInstance>
    : TMaybePromiseInstance => {
      const di = getDiKludge();

      return di.inject(injectableKey);
    },

    resetInstance: () => {
      const di = getDiKludge();

      // @ts-ignore
      return di.purge(injectableKey);
    },
  });
