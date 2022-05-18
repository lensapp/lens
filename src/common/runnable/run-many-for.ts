/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import type {
  DiContainerForInjection,
  InjectionToken,
} from "@ogre-tools/injectable";
import { filter, forEach, map, tap } from "lodash/fp";
import { throwWithIncorrectHierarchyFor } from "./throw-with-incorrect-hierarchy-for";

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

    const throwWithIncorrectHierarchy = throwWithIncorrectHierarchyFor(allRunnables);

    const recursedRun = async (
      runAfterRunnable: Runnable<any> | undefined = undefined,
    ) =>
      await pipeline(
        allRunnables,

        tap(runnables => forEach(throwWithIncorrectHierarchy, runnables)),

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
