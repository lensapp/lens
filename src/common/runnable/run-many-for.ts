/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { SingleOrMany } from "../utils";
import { getOrInsertSet, isDefined } from "../utils";
import { observable, when } from "mobx";
import * as uuid from "uuid";
import assert from "assert";

export interface Runnable<TParameter = void> {
  id: string;
  run: Run<TParameter>;
  runAfter?: SingleOrMany<Runnable<TParameter>>;
}

type Run<Param> = (parameter: Param) => Promise<void> | void;

export type RunMany = <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => Run<Param>;

const computedNextEdge = (traversed: string[], graph: Map<string, Set<string>>, currentId: string) => {
  const currentNode = graph.get(currentId);

  assert(currentNode, `Runnable graph does not contain node with id="${currentId}"`);

  for (const nextId of currentNode.values()) {
    if (traversed.includes(nextId)) {
      throw new Error(`Cycle in runnable graph: "${traversed.join(`" -> "`)}" -> "${nextId}"`);
    }

    computedNextEdge([...traversed, nextId], graph, nextId);
  }
};

const verifyRunnablesAreDAG = <Param>(runnables: Runnable<Param>[]) => {
  const rootId = uuid.v4();
  const runnableGraph = new Map<string, Set<string>>();

  // Build the Directed graph
  for (const runnable of runnables) {
    getOrInsertSet(runnableGraph, runnable.id);

    if (!runnable.runAfter) {
      getOrInsertSet(runnableGraph, rootId).add(runnable.id);
    } else if (Array.isArray(runnable.runAfter)) {
      for (const parentRunnable of runnable.runAfter) {
        getOrInsertSet(runnableGraph, parentRunnable.id).add(runnable.id);
      }
    } else {
      getOrInsertSet(runnableGraph, runnable.runAfter.id).add(runnable.id);
    }
  }

  // Do a DFS to find any cycles
  computedNextEdge([], runnableGraph, rootId);
};

const executeRunnableWith = <Param>(param: Param) => {
  const finishedIds = observable.set<string>();

  return async (runnable: Runnable<Param>): Promise<void> => {
    const parentRunnables = [runnable.runAfter].flat().filter(isDefined);

    for (const parentRunnable of parentRunnables) {
      await when(() => finishedIds.has(parentRunnable.id));
    }

    await runnable.run(param);
    finishedIds.add(runnable.id);
  };
};

export function runManyFor(di: DiContainerForInjection): RunMany {
  return <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => async (param: Param) => {
    const executeRunnable = executeRunnableWith(param);
    const allRunnables = di.injectMany(injectionToken);

    verifyRunnablesAreDAG(allRunnables);

    await Promise.all(allRunnables.map(executeRunnable));
  };
}
