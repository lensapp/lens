/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { PreferenceTab, PreferenceTypes } from "./preference-item-injection-token";
import type { Composite } from "../../../application-menu/main/menu-items/get-composite/get-composite";
import routePathParametersInjectable from "../../../../renderer/routes/route-path-parameters.injectable";
import preferencesRouteInjectable from "../../common/preferences-route.injectable";
import { filter, map } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { normalizeComposite } from "../../../application-menu/main/menu-items/get-composite/normalize-composite/normalize-composite";
import { findExactlyOne } from "../../../../common/utils/find-exactly-one/find-exactly-one";
import type { PreferenceTabsRoot } from "./preferences-composite.injectable";
import preferencesCompositeInjectable from "./preferences-composite.injectable";

const currentPreferenceTabCompositeInjectable = getInjectable({
  id: "current-preference-page-composite",

  instantiate: (di) => {
    const preferencesRoute = di.inject(preferencesRouteInjectable);
    const routePathParameters = di.inject(routePathParametersInjectable, preferencesRoute);
    const preferencesComposite = di.inject(preferencesCompositeInjectable);

    return computed(() => {
      const { preferenceTabId } = routePathParameters.get();

      return pipeline(
        normalizeComposite(preferencesComposite.get()),
        map(([, composite]) => composite),
        filter(isPreferenceTab),
        findExactlyOne(hasMatchingPathId(preferenceTabId)),
      );
    });
  },
});

const isPreferenceTab = (composite: Composite<PreferenceTypes | PreferenceTabsRoot>): composite is Composite<PreferenceTab> =>
  composite.value.kind === "tab";

const hasMatchingPathId =
  (preferenceTabId: string) =>
    ({ value: { pathId }}: Composite<PreferenceTab>) =>
      pathId === preferenceTabId;

export default currentPreferenceTabCompositeInjectable;
