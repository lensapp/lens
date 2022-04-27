/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {
  DiContainerForInjection,
  InjectionToken,
} from "@ogre-tools/injectable";

export interface Runnable<TParameter = void> {
  run: (parameter: TParameter) => Promise<void> | void;
}

export const runManyFor =
  (di: DiContainerForInjection) =>
  <TRunnable extends Runnable<unknown>>(
      injectionToken: InjectionToken<TRunnable, void>,
    ) =>
      async (parameter: Parameters<TRunnable["run"]>[0]) =>
        await Promise.all(
          di.injectMany(injectionToken).map((runnable) => runnable.run(parameter)),
        );
