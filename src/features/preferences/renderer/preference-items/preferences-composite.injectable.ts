/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import type { PreferenceItemTypes } from "./preference-item-injection-token";
import { preferenceItemInjectionToken } from "./preference-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import type { PreferenceTabsRoot } from "./preference-tab-root";
import { preferenceTabsRoot } from "./preference-tab-root";
import logErrorInjectable from "../../../../common/log-error.injectable";
import { isShown } from "../../../../common/utils/composable-responsibilities/showable/showable";
import { orderByOrderNumber } from "../../../../common/utils/composable-responsibilities/orderable/orderable";
import { getCompositeFor } from "../../../../common/utils/composite/get-composite/get-composite";

const preferencesCompositeInjectable = getInjectable({
  id: "preferences-composite",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const preferenceItems = computedInjectMany(preferenceItemInjectionToken);
    const logError = di.inject(logErrorInjectable);

    const getComposite = getCompositeFor<PreferenceItemTypes | PreferenceTabsRoot>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,

      handleMissingParentIds: (ids) => {
        logError(
          `Tried to create preferences, but encountered references to unknown ids: "${ids.missingParentIds.join(
            '", "',
          )}". Available ids are: "${ids.availableParentIds.join('", "')}"`,
        );
      },

      transformChildren: (children) =>
        pipeline(
          children.filter(isShown),
          orderByOrderNumber,
        ),
    });

    return computed(() =>
      pipeline(
        [preferenceTabsRoot, ...preferenceItems.get()],
        getComposite,
      ),
    );
  },
});

export default preferencesCompositeInjectable;
