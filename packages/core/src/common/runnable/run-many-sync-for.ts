/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { Composite } from "../utils/composite/get-composite/get-composite";
import { getCompositeFor } from "../utils/composite/get-composite/get-composite";
import * as uuid from "uuid";

export interface RunnableSync<TParameter = void> {
  id: string;
  run: RunSync<TParameter>;
  runAfter?: RunnableSync<TParameter>;
}

/**
 * NOTE: this is the worse of two evils. This makes sure that `RunnableSync` always is sync.
 * If the return type is `void` instead then async functions (those return `Promise<T>`) can
 * coerce to it.
 */
type RunSync<Param> = (parameter: Param) => undefined;

export type RunManySync = <Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>) => RunSync<Param>;

function runCompositeRunnableSyncs<Param>(param: Param, composite: Composite<RunnableSync<Param>>): undefined {
  composite.value.run(param);
  composite.children.map(composite => runCompositeRunnableSyncs(param, composite));

  return undefined;
}

export function runManySyncFor(di: DiContainerForInjection): RunManySync {
  return <Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>) => (param: Param): undefined => {
    const allRunnables = di.injectMany(injectionToken);
    const rootId = uuid.v4();
    const getCompositeRunnables = getCompositeFor<RunnableSync<Param>>({
      getId: (runnable) => runnable.id,
      getParentId: (runnable) => (
        runnable.id === rootId
          ? undefined
          : runnable.runAfter?.id ?? rootId
      ),
    });
    const composite = getCompositeRunnables([
      // This is a dummy runnable to conform to the requirements of `getCompositeFor` to only have one root
      {
        id: rootId,
        run: () => undefined,
      },
      ...allRunnables,
    ]);

    return runCompositeRunnableSyncs(param, composite);
  };
}
