/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, Injectable, InjectionInstanceWithMeta, InjectionToken } from "@ogre-tools/injectable";
import { getOrInsertSetFor, isDefined } from "../utils";
import * as uuid from "uuid";
import assert from "assert";
import type { Runnable, RunnableSync, RunnableSyncWithId, RunnableWithId } from "./types";

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

export function verifyRunnablesAreDAG<Param>(injectionToken: InjectionToken<Runnable<Param>, void>, runnables: RunnableWithId<Param>[]): void;
export function verifyRunnablesAreDAG<Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>, runnables: RunnableSyncWithId<Param>[]): void;

export function verifyRunnablesAreDAG<Param>(injectionToken: InjectionToken<Runnable<Param>, void> | InjectionToken<RunnableSync<Param>, void>, runnables: (RunnableWithId<Param>[]) | (RunnableSyncWithId<Param>[])): void {
  const rootId = uuid.v4();
  const runnableGraph = new Map<string, Set<string>>();
  const seenIds = new Set<string>();
  const addRunnableId = getOrInsertSetFor(runnableGraph);

  // Build the Directed graph
  for (const runnable of runnables) {
    addRunnableId(runnable.id);

    if (runnable.runAfter.length === 0) {
      addRunnableId(rootId).add(runnable.id);
    } else {
      for (const parentRunnable of runnable.runAfter) {
        addRunnableId(parentRunnable.id).add(runnable.id);
      }
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
}

export const convertToWithIdWith = (di: DiContainerForInjection) => {
  const convertToWithIdPlain = <Param>(injectable: Injectable<Runnable<Param>, Runnable<Param>, void>): RunnableWithId<Param> => {
    const instance = di.inject(injectable);

    return ({
      id: injectable.id,
      run: instance.run,
      runAfter: [instance.runAfter]
        .flat()
        .filter(isDefined)
        .map(convertToWithIdPlain),
    });
  };

  function convertToWithId<Param>(src: InjectionInstanceWithMeta<Runnable<Param>>): RunnableWithId<Param>;
  function convertToWithId<Param>(src: InjectionInstanceWithMeta<RunnableSync<Param>>): RunnableSyncWithId<Param>;

  function convertToWithId<Param>(src: InjectionInstanceWithMeta<Runnable<Param>> | InjectionInstanceWithMeta<RunnableSync<Param>>): RunnableWithId<Param> | RunnableSyncWithId<Param> {
    return ({
      id: src.meta.id,
      run: src.instance.run,
      runAfter: [src.instance.runAfter]
        .flat()
        .filter(isDefined)
        .map(convertToWithIdPlain),
    });
  }

  return convertToWithId;
};
