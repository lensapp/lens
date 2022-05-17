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
  run: Run<TParameter>;
  runAfter?: this;
}

type Run<Param> = (parameter: Param) => Promise<void> | void;

export type RunMany = <Param>(
  injectionToken: InjectionToken<Runnable<Param>, void>
) => Run<Param>;

export function runManyFor(di: DiContainerForInjection): RunMany {
  return (injectionToken) => async (parameter) => {
    const allRunnables = di.injectMany(injectionToken);

    const recursedRun = async (
      runAfterRunnable: Runnable<any> | undefined = undefined,
    ) =>
      await pipeline(
        allRunnables,

        filter((runnable) => runnable.runAfter === runAfterRunnable),

        map(async (runnable) => {
          await runnable.run(parameter);

          await recursedRun(runnable);
        }),

        (promises) => Promise.all(promises),
      );

    await recursedRun();
  };
}
