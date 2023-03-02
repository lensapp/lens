/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionInstanceWithMeta } from "@ogre-tools/injectable";
import { getOrInsertSetFor, isDefined } from "@k8slens/utilities";
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

/**
 * Verifies that the graph produces by `runnables`'s `runAfter`'s is acyclic. Namely that it
 * produces a Directed Acyclic Graph.
 * @param tokenId The ID of the injectionToken that was `injectManyWithMeta()`-ed. Used for error messages
 * @param runnables The list of runnables to check.
 */
export function verifyRunnablesAreDAG<Param>(tokenId: string, runnables: RunnableWithId<Param>[]): void;
export function verifyRunnablesAreDAG<Param>(tokenId: string, runnables: RunnableSyncWithId<Param>[]): void;

export function verifyRunnablesAreDAG<Param>(tokenId: string, runnables: (RunnableWithId<Param>[]) | (RunnableSyncWithId<Param>[])): void {
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
        throw new Error(`Runnable "${id}" is not part of the injection token "${tokenId}"`);
      }

      const runAfters = [runnable.runAfter]
        .flat()
        .filter(isDefined)
        .map(runnable => runnable.id)
        .join('", "');

      throw new Error(`Runnable "${id}" is unreachable for injection token "${tokenId}": run afters "${runAfters}" are a part of different injection tokens.`);
    }
  }
}

export interface ConvertToWithId {
  <Param>(src: InjectionInstanceWithMeta<Runnable<Param>>): RunnableWithId<Param>;
  <Param>(src: InjectionInstanceWithMeta<RunnableSync<Param>>): RunnableSyncWithId<Param>;
}

export const convertToWithIdWith = (di: DiContainerForInjection) => {
  const convert = <Param>(meta: { id: string }, instance: Runnable<Param>): RunnableWithId<Param> => ({
    id: meta.id,
    run: instance.run,
    runAfter: [instance.runAfter]
      .flat()
      .filter(isDefined)
      .map((injectable) => convert(injectable, di.inject(injectable))),
  });

  return ((src) => convert(src.meta, src.instance)) as ConvertToWithId;
};
