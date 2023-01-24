/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { SingleOrMany } from "../utils";
import { getOrInsert, getOrInsertSetFor, isDefined } from "../utils";
import * as uuid from "uuid";
import assert from "assert";
import type { Asyncify } from "type-fest";
import type TypedEventEmitter from "typed-emitter";
import EventEmitter from "events";

export interface Runnable<TParameter = void> {
  id: string;
  run: Run<TParameter>;
  runAfter?: SingleOrMany<Runnable<TParameter>>;
}

type Run<Param> = (parameter: Param) => Promise<void> | void;

export type RunMany = <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => Asyncify<Run<Param>>;

const computedNextEdge = (traversed: string[], graph: Map<string, Set<string>>, currentId: string, seenIds: Set<string>) => {
  seenIds.add(currentId);
  const currentNode = graph.get(currentId);

  assert(currentNode, `Runnable graph does not contain node with id="${currentId}"`);

  for (const nextId of currentNode.values()) {
    if (traversed.includes(nextId)) {
      throw new Error(`Cycle in runnable graph: "${traversed.join(`" -> "`)}" -> "${nextId}"`);
    }

    computedNextEdge([...traversed, nextId], graph, nextId, seenIds);
  }
};

const verifyRunnablesAreDAG = <Param>(injectionToken: InjectionToken<Runnable<Param>, void>, runnables: Runnable<Param>[]) => {
  const rootId = uuid.v4();
  const runnableGraph = new Map<string, Set<string>>();
  const seenIds = new Set<string>();
  const addRunnableId = getOrInsertSetFor(runnableGraph);

  // Build the Directed graph
  for (const runnable of runnables) {
    addRunnableId(runnable.id);

    if (!runnable.runAfter || (Array.isArray(runnable.runAfter) && runnable.runAfter.length === 0)) {
      addRunnableId(rootId).add(runnable.id);
    } else if (Array.isArray(runnable.runAfter)) {
      for (const parentRunnable of runnable.runAfter) {
        addRunnableId(parentRunnable.id).add(runnable.id);
      }
    } else {
      addRunnableId(runnable.runAfter.id).add(runnable.id);
    }
  }

  addRunnableId(rootId);

  // Do a DFS to find any cycles
  computedNextEdge([], runnableGraph, rootId, seenIds);

  for (const id of runnableGraph.keys()) {
    if (!seenIds.has(id)) {
      const runnable = runnables.find(runnable => runnable.id === id);

      if (!runnable) {
        throw new Error(`Runnable "${id}" is not part of the injection token "${injectionToken.id}"`);
      }

      const runAfters = [runnable.runAfter]
        .flat()
        .filter(isDefined)
        .map(runnable => runnable.id)
        .join('", "');

      throw new Error(`Runnable "${id}" is unreachable for injection token "${injectionToken.id}": run afters "${runAfters}" are a part of different injection tokens.`);
    }
  }
};

interface BarrierEvent {
  finish: (id: string) => void;
}

class DynamicBarrier {
  private readonly finishedIds = new Map<string, Promise<void>>();
  private readonly events: TypedEventEmitter<BarrierEvent> = new EventEmitter();

  private initFinishingPromise(id: string): Promise<void> {
    return getOrInsert(this.finishedIds, id, new Promise(resolve => {
      const handler = (finishedId: string) => {
        if (finishedId === id) {
          resolve();
          this.events.removeListener("finish", handler);
        }
      };

      this.events.addListener("finish", handler);
    }));
  }

  setFinished(id: string): void {
    void this.initFinishingPromise(id);

    this.events.emit("finish", id);
  }

  async blockOn(id: string): Promise<void> {
    await this.initFinishingPromise(id);
  }
}

const executeRunnableWith = <Param>(param: Param) => {
  const barrier = new DynamicBarrier();

  return async (runnable: Runnable<Param>): Promise<void> => {
    const parentRunnables = [runnable.runAfter].flat().filter(isDefined);

    for (const parentRunnable of parentRunnables) {
      await barrier.blockOn(parentRunnable.id);
    }

    await runnable.run(param);
    barrier.setFinished(runnable.id);
  };
};

export function runManyFor(di: DiContainerForInjection): RunMany {
  return <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => async (param: Param) => {
    const executeRunnable = executeRunnableWith(param);
    const allRunnables = di.injectMany(injectionToken);

    verifyRunnablesAreDAG(injectionToken, allRunnables);

    await Promise.all(allRunnables.map(executeRunnable));
  };
}
