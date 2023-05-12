/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import type { PreferenceItemTypes } from "./preference-item-injection-token";
import { preferenceItemInjectionToken } from "./preference-item-injection-token";
import type { PreferenceTabsRoot } from "./preference-tab-root";
import { preferenceTabsRoot } from "./preference-tab-root";
import logErrorInjectable from "../../../../common/log-error.injectable";
import { isShown } from "../../../../common/utils/composable-responsibilities/showable/showable";
import { getCompositeFor } from "../../../../common/utils/composite/get-composite/get-composite";
import { byOrderNumber } from "@k8slens/utilities";

const preferencesCompositeInjectable = getInjectable({
  id: "preferences-composite",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const preferenceItems = computedInjectMany(preferenceItemInjectionToken);
    const logError = di.inject(logErrorInjectable);

    const getComposite = getCompositeFor<PreferenceItemTypes | PreferenceTabsRoot>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,

      handleMissingParentIds: ({ missingParentIds, availableParentIds }) => {
        const missingIds = missingParentIds.join('", "');
        const availableIds = availableParentIds.join("\n");

        logError([
          `Tried to create preferences, but encountered references to unknown ids: "${missingIds}".`,
          "Available ids are:",
          availableIds,
        ].join("\n\n"));
      },

      transformChildren: (children) => (
        children
          .filter(isShown)
          .sort(byOrderNumber)
      ),
    });

    return computed(() => getComposite([preferenceTabsRoot, ...preferenceItems.get()]));
  },
});

export default preferencesCompositeInjectable;
