/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import activeHotbarInjectable from "./active.injectable";
import type { Hotbar } from "./hotbar";

export type ActiveHotbarModel = Pick<Hotbar, "hasEntity" | "addEntity" | "removeEntity" | "toggleEntity">;

const activeHotbarModelInjectable = getInjectable({
  id: "active-hotbar-model",
  instantiate: (di): ActiveHotbarModel => {
    const activeHotbar = di.inject(activeHotbarInjectable);

    return {
      hasEntity: (entityId) => activeHotbar.get()?.hasEntity(entityId) ?? false,
      toggleEntity: (entity) => activeHotbar.get()?.toggleEntity(entity),
      addEntity: (entity) => activeHotbar.get()?.addEntity(entity),
      removeEntity: (entityId) => activeHotbar.get()?.removeEntity(entityId),
    };
  },
});

export default activeHotbarModelInjectable;
