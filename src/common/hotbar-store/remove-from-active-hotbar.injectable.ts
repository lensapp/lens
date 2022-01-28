/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { bind } from "../utils";
import activeHotbarInjectable from "./active-hotbar.injectable";
import type { Hotbar } from "./hotbar";

interface Dependencies {
  hotbar: IComputedValue<Hotbar>;
}

function removeByIdFromActiveHotbar({ hotbar }: Dependencies, id: string) {
  return hotbar.get().removeItemById(id);
}

const removeByIdFromActiveHotbarInjectable = getInjectable({
  instantiate: (di) => bind(removeByIdFromActiveHotbar, null, {
    hotbar: di.inject(activeHotbarInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default removeByIdFromActiveHotbarInjectable;
