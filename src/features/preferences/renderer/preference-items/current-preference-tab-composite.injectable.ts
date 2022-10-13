/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import type { PreferenceTab, PreferenceTypes } from "./preference-item-injection-token";
import { preferenceItemInjectionToken } from "./preference-item-injection-token";
import type { Composite } from "../../../application-menu/main/menu-items/get-composite/get-composite";
import getComposite from "../../../application-menu/main/menu-items/get-composite/get-composite";
import routePathParametersInjectable from "../../../../renderer/routes/route-path-parameters.injectable";
import preferencesRouteInjectable from "../../common/preferences-route.injectable";
import { filter, find } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";

interface PreferenceTabsRoot {
  kind: "preference-tabs-root";
  id: string;
  parentId: undefined;
  isShown: true;
}

const preferenceTabRoot: PreferenceTabsRoot = {
  kind: "preference-tabs-root" as const,
  id: "preference-tabs",
  parentId: undefined,
  isShown: true,
};

const currentPreferenceTabCompositeInjectable = getInjectable({
  id: "current-preference-page-composite",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const preferenceItems = computedInjectMany(preferenceItemInjectionToken);
    const preferencesRoute = di.inject(preferencesRouteInjectable);
    const routePathParameters = di.inject(routePathParametersInjectable, preferencesRoute);

    return computed(() => {
      const { preferenceTabId } = routePathParameters.get();

      const tabComposite = pipeline(
        [preferenceTabRoot, ...preferenceItems.get()],
        filter(isShown),
        (items) => getComposite({ source: items }),
        (rootComposite) => rootComposite.children,
        filter(isPreferenceTab),
        find(hasMatchingPathId(preferenceTabId)),
      );

      if (!tabComposite) {
        throw new Error(
          `Tried to open preferences but no tab exists for ID "${preferenceTabId}"`,
        );
      }

      return tabComposite;
    });
  },
});

const isShown = (item: PreferenceTypes) => item.isShown ?? true;

const isPreferenceTab = (composite: Composite<PreferenceTypes | PreferenceTabsRoot>): composite is Composite<PreferenceTab> =>
  composite.value.kind === "tab";

const hasMatchingPathId =
  (preferenceTabId: string) =>
    ({ value: { pathId }}: Composite<PreferenceTab>) =>
      pathId === preferenceTabId;

export default currentPreferenceTabCompositeInjectable;
