/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tabs } from "../../../../renderer/components/tabs";
import React from "react";
import type { Composite } from "../../../application-menu/main/menu-items/get-composite/get-composite";
import type { PreferenceTypes } from "../preference-items/preference-item-injection-token";
import { Map } from "../../../../renderer/components/map/map";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import preferencesCompositeInjectable from "../preference-items/preferences-composite.injectable";
import { observer } from "mobx-react";
import { PreferencesNavigationTab } from "./preferences-navigation-tab";

interface Dependencies {
  composite: IComputedValue<Composite<PreferenceTypes>>;
}

const NonInjectedPreferencesNavigation = observer(({ composite }: Dependencies) => (
  <Tabs className="flex column" scrollable={false}>
    <Map items={composite.get().children}>{toNavigationHierarchy}</Map>
  </Tabs>
));

export const PreferencesNavigation = withInjectables<Dependencies>(
  NonInjectedPreferencesNavigation,

  {
    getProps: (di) => ({
      composite: di.inject(preferencesCompositeInjectable),
    }),
  },
);


const toNavigationHierarchy = (composite: Composite<PreferenceTypes>) => {
  const value = composite.value;

  switch (value.kind) {
    case "page":
    case "item":

    // eslint-disable-next-line no-fallthrough
    case "group": {
      throw new Error("Should never come here");
    }

    case "tab-group": {
      return (
        <>
          <div className="header">{value.label}</div>

          <Map items={composite.children}>{toNavigationHierarchy}</Map>
        </>
      );
    }

    case "tab": {
      return (
        <PreferencesNavigationTab tab={value} />
      );
    }

    default: {
      // Note: this will fail at transpilation time, if all kinds
      // are not handled in switch/case.
      const _exhaustiveCheck: never = value;

      // Note: this code is unreachable, it is here to make ts not complain about
      // _exhaustiveCheck not being used.
      // See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      throw new Error(
        `Tried to create preference navigation, but foreign item was encountered: ${_exhaustiveCheck} ${composite.value}`,
      );
    }
  }
};
