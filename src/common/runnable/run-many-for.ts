/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import type {
  DiContainerForInjection,
  InjectionToken,
} from "@ogre-tools/injectable";
import { filter, map } from "lodash/fp";

export interface Runnable<TParameter = void> {
  run: (parameter: TParameter) => Promise<void> | void;
  runAfter?: this;
}

export const runManyFor =
  (di: DiContainerForInjection) =>
  <TRunnable extends Runnable<unknown>>(
      injectionToken: InjectionToken<TRunnable, void>,
    ) =>
      async (parameter: Parameters<TRunnable["run"]>[0]) => {
        const allRunnables = di.injectMany(injectionToken);

        const recursedRun = async (runAfterRunnable: Runnable<unknown> = undefined) =>
          await pipeline(
            allRunnables,

            filter((runnable) => runnable.runAfter === runAfterRunnable),

            map(async (runnable) => {
              await runnable.run(parameter);

              await recursedRun(runnable);
            }),

            promises => Promise.all(promises),
          );

        await recursedRun();
      };



