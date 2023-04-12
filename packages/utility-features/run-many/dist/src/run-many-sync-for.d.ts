/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { RunnableSync, RunSync } from "./types";
export type RunManySync = <Param>(injectionToken: InjectionToken<RunnableSync<Param>, void>) => RunSync<Param>;
export declare function runManySyncFor(di: DiContainerForInjection): RunManySync;
