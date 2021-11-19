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
declare module "@ogre-tools/injectable" {
  type Awaited<TMaybePromise> = TMaybePromise extends PromiseLike<infer TValue>
    ? TValue
    : TMaybePromise;

  export interface DependencyInjectionContainer {
    inject: <
      TInjectable extends Injectable<TInstance, TDependencies>,
      TInstance,
      TDependencies,
      TMaybePromiseInstance = ReturnType<TInjectable["instantiate"]>,
    >(
      injectableKey: TInjectable,
    ) => TMaybePromiseInstance extends PromiseLike<any>
      ? Awaited<TMaybePromiseInstance>
      : TMaybePromiseInstance;
  }

  export interface ConfigurableDependencyInjectionContainer
    extends DependencyInjectionContainer {
    register: (injectable: Injectable<any>) => void;
    preventSideEffects: () => void;

    override: <TInjectable extends Injectable<TInstance, any>, TInstance>(
      injectable: TInjectable,
      overrider:
        | ReturnType<TInjectable["instantiate"]>
        | jest.MockInstance<
            ReturnType<TInjectable["instantiate"]>,
            ReturnType<TInjectable["getDependencies"]>
          >,
    ) => void;
  }

  export interface Injectable<
    TInstance,
    TDependencies extends object = {},
    TInstantiationParameter extends object = {},
  > {
    id?: string;

    getDependencies: (
      di?: DependencyInjectionContainer,
    ) => TDependencies | Promise<TDependencies>;

    lifecycle?: lifecycleEnum;

    instantiate: (
      dependencies: TDependencies,
      instantiationParameter: TInstantiationParameter,
    ) => Promise<TInstance> | TInstance;

    causesSideEffects?: boolean;
  }

  export enum lifecycleEnum {
    singleton,
    transient,
    scopedTransient,
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  export const createContainer = (...getRequireContexts: any[]) =>
    ConfigurableDependencyInjectionContainer;
}
