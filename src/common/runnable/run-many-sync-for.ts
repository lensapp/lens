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

export interface RunnableSync<TParameter = void> {
  run: (parameter: TParameter) => void;
  runAfter?: this;
}

export const runManySyncFor =
  (di: DiContainerForInjection) =>
  <TRunnable extends RunnableSync<unknown>>(
      injectionToken: InjectionToken<TRunnable, void>,
    ) =>
      (parameter: Parameters<TRunnable["run"]>[0]) => {
        const allRunnables = di.injectMany(injectionToken);

        const recursedRun = (runAfterRunnable: RunnableSync<unknown> = undefined) =>
          pipeline(
            allRunnables,

            filter((runnable) => runnable.runAfter === runAfterRunnable),

            map((runnable) => {
              runnable.run(parameter);

              recursedRun(runnable);
            }),
          );

        recursedRun();
      };
