/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getOrInsertSet, toggle } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

export type ToggleTableColumnVisibility = (tableId: string, columnId: string) => void;

const toggleTableColumnVisibilityInjectable = getInjectable({
  id: "toggle-table-column-visibility",
  instantiate: (di): ToggleTableColumnVisibility => {
    const state = di.inject(userPreferencesStateInjectable);

    return action((tableId, columnId) => {
      toggle(getOrInsertSet(state.hiddenTableColumns, tableId), columnId);
    });
  },
});

export default toggleTableColumnVisibilityInjectable;
