/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { Composite } from "../utils/composite/get-composite/get-composite";
import { getCompositeFor } from "../utils/composite/get-composite/get-composite";
import * as uuid from "uuid";

export interface Runnable<TParameter = void> {
  id: string;
  run: Run<TParameter>;
  runAfter?: Runnable<TParameter>;
}

type Run<Param> = (parameter: Param) => Promise<void> | void;

export type RunMany = <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => Run<Param>;

async function runCompositeRunnables<Param>(param: Param, composite: Composite<Runnable<Param>>) {
  await composite.value.run(param);
  await Promise.all(composite.children.map(composite => runCompositeRunnables(param, composite)));
}

export function runManyFor(di: DiContainerForInjection): RunMany {
  return <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => async (param: Param) => {
    const allRunnables = di.injectMany(injectionToken);
    const rootId = uuid.v4();
    const getCompositeRunnables = getCompositeFor<Runnable<Param>>({
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
        run: () => {},
      },
      ...allRunnables,
    ]);

    await runCompositeRunnables(param, composite);
  };
}
