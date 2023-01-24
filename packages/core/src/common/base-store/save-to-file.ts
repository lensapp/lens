/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type Config from "conf";

export type PersistStateToConfig = <T extends object>(config: Config<T>, state: T) => void;

export const persistStateToConfigInjectionToken = getInjectionToken<PersistStateToConfig>({
  id: "persist-state-to-config-token",
});
