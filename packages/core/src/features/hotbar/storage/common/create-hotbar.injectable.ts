/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CreateHotbarData } from "./types";
import { prefixedLoggerInjectable } from "@k8slens/logger";
import type { HotbarDependencies } from "./hotbar";
import { Hotbar } from "./hotbar";

export type CreateHotbar = (data: CreateHotbarData) => Hotbar;

const createHotbarInjectable = getInjectable({
  id: "create-hotbar",
  instantiate: (di): CreateHotbar => {
    const deps: HotbarDependencies = {
      logger: di.inject(prefixedLoggerInjectable, "HOTBAR"),
    };

    return (data) => new Hotbar(deps, data);
  },
});

export default createHotbarInjectable;
