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
/// <reference types="react" />
declare module "@ogre-tools/injectable-react" {
  import type { IDependencyInjectionContainer } from "@ogre-tools/injectable";

  interface IDependencyInjectionContainerProviderProps {
    di: IDependencyInjectionContainer;
  }

  export const DiContextProvider: React.Provider<IDependencyInjectionContainerProviderProps>;

  export const Inject: <
    TComponentInjectable extends IComponentInjectable<any, {}>,
  >({
    Component,
    injectableKey,
    getPlaceholder,
    ...props
  }: Omit<
    React.ComponentProps<TComponentInjectable["instantiate"]>,
    keyof ReturnType<TComponentInjectable["getDependencies"]>
  > & {
    injectableKey: TComponentInjectable;
    getPlaceholder?: () => JSX.Element | null;
  }) => JSX.Element;
}
