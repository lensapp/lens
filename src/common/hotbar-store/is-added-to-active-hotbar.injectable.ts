/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { CatalogEntity } from "../catalog";
import { bind } from "../utils";
import activeHotbarInjectable from "./active-hotbar.injectable";
import type { Hotbar } from "./hotbar";

interface Dependencies {
  hotbar: IComputedValue<Hotbar>;
}

function isAddedToActiveHotbar({ hotbar }: Dependencies, entity: CatalogEntity) {
  return hotbar.get().hasItem(entity);
}

const isItemInActiveHotbarInjectable = getInjectable({
  instantiate: (di) => bind(isAddedToActiveHotbar, null, {
    hotbar: di.inject(activeHotbarInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default isItemInActiveHotbarInjectable;
