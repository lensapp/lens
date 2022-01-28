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

function addToActiveHotbar({ hotbar }: Dependencies, entity: CatalogEntity, cellIndex?: number) {
  return hotbar.get().addItem(entity, cellIndex);
}

const addToActiveHotbarInjectable = getInjectable({
  instantiate: (di) => bind(addToActiveHotbar, null, {
    hotbar: di.inject(activeHotbarInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default addToActiveHotbarInjectable;
