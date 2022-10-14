/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import type { PreferenceTypes } from "./preference-item-injection-token";
import { preferenceItemInjectionToken } from "./preference-item-injection-token";
import getComposite from "../../../application-menu/main/menu-items/get-composite/get-composite";
import { filter } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";

export interface PreferenceTabsRoot {
  kind: "preference-tabs-root";
  id: string;
  parentId: undefined;
  isShown: true;
}

const preferenceTabsRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: true,
};

const preferencesCompositeInjectable = getInjectable({
  id: "preferences-composite",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const preferenceItems = computedInjectMany(preferenceItemInjectionToken);

    return computed(() =>
      pipeline(
        [preferenceTabsRoot, ...preferenceItems.get()],
        filter(isShown),
        (items) => getComposite({ source: items }),
      ),
    );
  },
});

const isShown = (item: PreferenceTypes) => item.isShown ?? true;

export default preferencesCompositeInjectable;
