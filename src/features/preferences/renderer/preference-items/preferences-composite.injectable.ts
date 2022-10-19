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
import { preferenceTabsRoot } from "./preference-tab-root";
import logErrorInjectable from "../../../../common/log-error.injectable";
import { isBoolean } from "../../../../common/utils";

const preferencesCompositeInjectable = getInjectable({
  id: "preferences-composite",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const preferenceItems = computedInjectMany(preferenceItemInjectionToken);
    const logError = di.inject(logErrorInjectable);

    return computed(() =>
      pipeline(
        [preferenceTabsRoot, ...preferenceItems.get()],

        filter((item: PreferenceTypes) => {
          if (item.isShown === undefined) {
            return true;
          }

          if (isBoolean(item.isShown)) {
            return item.isShown;
          }

          return item.isShown.get();
        }),

        (items) =>
          getComposite({
            source: items,

            handleMissingParentIds: (ids) => {
              logError(
                `Tried to create preferences, but encountered references to unknown ids: "${ids.missingParentIds.join(
                  '", "',
                )}". Available ids are: "${ids.availableParentIds.join(
                  '", "',
                )}"`,
              );
            },
          }),
      ),
    );
  },
});

export default preferencesCompositeInjectable;
