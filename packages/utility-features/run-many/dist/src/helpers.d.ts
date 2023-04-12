/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionInstanceWithMeta } from "@ogre-tools/injectable";
import type { Runnable, RunnableSync, RunnableSyncWithId, RunnableWithId } from "./types";
/**
 * Verifies that the graph produces by `runnables`'s `runAfter`'s is acyclic. Namely that it
 * produces a Directed Acyclic Graph.
 * @param tokenId The ID of the injectionToken that was `injectManyWithMeta()`-ed. Used for error messages
 * @param runnables The list of runnables to check.
 */
export declare function verifyRunnablesAreDAG<Param>(tokenId: string, runnables: RunnableWithId<Param>[]): void;
export declare function verifyRunnablesAreDAG<Param>(tokenId: string, runnables: RunnableSyncWithId<Param>[]): void;
export interface ConvertToWithId {
    <Param>(src: InjectionInstanceWithMeta<Runnable<Param>>): RunnableWithId<Param>;
    <Param>(src: InjectionInstanceWithMeta<RunnableSync<Param>>): RunnableSyncWithId<Param>;
}
export declare const convertToWithIdWith: (di: DiContainerForInjection) => ConvertToWithId;
