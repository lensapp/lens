/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import hotbarsInjectable from "./hotbars.injectable";

export type RemoveEntityFromAllHotbars = (entityId: string) => void;

const removeEntityFromAllHotbarsInjectable = getInjectable({
  id: "remove-entity-from-all-hotbars",
  instantiate: (di): RemoveEntityFromAllHotbars => {
    const hotbars = di.inject(hotbarsInjectable);

    return action((entityId) => {
      for (const hotbar of hotbars.get()) {
        hotbar.removeEntity(entityId);
      }
    });
  },
});

export default removeEntityFromAllHotbarsInjectable;
