/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "../../../renderer/components/+preferences/preferences.scss";
import React from "react";

import { SettingLayout } from "../../../renderer/components/layout/setting-layout";
import { PreferencesNavigation } from "../../../renderer/components/+preferences/preferences-navigation/preferences-navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import closePreferencesInjectable from "../../../renderer/components/+preferences/close-preferences.injectable";
import currentPreferenceTabCompositeInjectable from "./preference-items/current-preference-tab-composite.injectable";
import type { Composite } from "../../application-menu/main/menu-items/get-composite/get-composite";
import type { PreferenceTypes, PreferenceTab } from "./preference-items/preference-item-injection-token";
import type { IComputedValue } from "mobx";
import { Map } from "../../../renderer/components/map/map";

interface Dependencies {
  closePreferences: () => void;
  pageComposite: IComputedValue<Composite<PreferenceTab>>;
}

const NonInjectedPreferences = ({
  closePreferences,
  pageComposite,
}: Dependencies) => {
  const composite = pageComposite.get();

  return (
    <SettingLayout
      navigation={<PreferencesNavigation />}
      className="Preferences"
      contentGaps={false}
      closeButtonProps={{ "data-testid": "close-preferences" }}
      back={closePreferences}
      data-testid={composite.value.testId}
    >
      {toPreferenceItemHierarchy(composite)}
    </SettingLayout>
  );
};

const toPreferenceItemHierarchy = (composite: Composite<PreferenceTypes>) => {
  switch (composite.value.kind) {

    case "group": {
      return (
        <section id={composite.value.id}>
          <Map items={composite.children} getSeparator={composite.value.childrenSeparator}>
            {toPreferenceItemHierarchy}
          </Map>
        </section>
      );
    }

    case "item":

    // eslint-disable-next-line no-fallthrough
    case "page": {
      const Component = composite.value.Component;

      return (
        <Component>
          <Map items={composite.children} getSeparator={composite.value.childrenSeparator}>
            {toPreferenceItemHierarchy}
          </Map>
        </Component>
      );
    }

    case "tab": {
      return (
        <Map items={composite.children}>
          {toPreferenceItemHierarchy}
        </Map>
      );
    }

    default: {
      // Note: this will fail at transpilation time, if all ApplicationMenuItemTypes
      // are not handled in switch/case.
      const _exhaustiveCheck: never = composite.value;

      // Note: this code is unreachable, it is here to make ts not complain about
      // _exhaustiveCheck not being used.
      // See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      throw new Error(`Tried to create preferences, but foreign item was encountered: ${_exhaustiveCheck} ${composite.value}`);
    }
  }
};

export const Preferences = withInjectables<Dependencies>(
  NonInjectedPreferences,

  {
    getProps: (di, props) => ({
      closePreferences: di.inject(closePreferencesInjectable),
      pageComposite: di.inject(currentPreferenceTabCompositeInjectable),
      ...props,
    }),
  },
);

