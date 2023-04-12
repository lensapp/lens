/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import type { Runnable, Run } from "./types";
import type { Asyncify } from "type-fest";
export type RunMany = <Param>(injectionToken: InjectionToken<Runnable<Param>, void>) => Asyncify<Run<Param>>;
export declare function runManyFor(di: DiContainerForInjection): RunMany;
