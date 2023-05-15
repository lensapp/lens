/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tabs } from "../../../../renderer/components/tabs";
import React from "react";
import type { Composite } from "../../../../common/utils/composite/get-composite/get-composite";
import type { PreferenceItemTypes } from "../preference-items/preference-item-injection-token";
import { Map } from "../../../../renderer/components/map/map";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import preferencesCompositeInjectable from "../preference-items/preferences-composite.injectable";
import { observer } from "mobx-react";
import { PreferencesNavigationTab } from "./preferences-navigation-tab";
import { compositeHasDescendant } from "../../../../common/utils/composite/composite-has-descendant/composite-has-descendant";
import type { PreferenceTabsRoot } from "../preference-items/preference-tab-root";
import { Icon } from "@k8slens/icon";
import { checkThatAllDiscriminablesAreExhausted } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { NavigateToPreferenceTab } from "./navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab/navigate-to-preference-tab.injectable";

interface Dependencies {
  composite: IComputedValue<Composite<PreferenceItemTypes | PreferenceTabsRoot>>;
  navigateToPreferenceTab: NavigateToPreferenceTab;
}

const NonInjectedPreferencesNavigation = observer(({
  composite,
  navigateToPreferenceTab,
}: Dependencies) => (
  <Tabs<string>
    className="flex column"
    scrollable={false}
    onChange={navigateToPreferenceTab}
  >
    {toNavigationHierarchy(composite.get())}
  </Tabs>
));

export const PreferencesNavigation = withInjectables<Dependencies>(NonInjectedPreferencesNavigation, {
  getProps: (di) => ({
    composite: di.inject(preferencesCompositeInjectable),
    navigateToPreferenceTab: di.inject(navigateToPreferenceTabInjectable),
  }),
});

const toNavigationHierarchy = (composite: Composite<PreferenceItemTypes | PreferenceTabsRoot>) => {
  const value = composite.value;

  switch (value.kind) {
    // Note: These preference item types are not rendered in navigation,
    // yet they are interesting for deciding if eg. a tab group or a tab has content
    // somewhere in structure, and therefore not be hidden.
    case "page":

    // Intentional case fallthrough
    case "block": {
      return emptyRender;
    }

    case "tab-group": {
      return (
        <div data-preference-tab-group-test={value.id}>
          <div className="header flex items-center">
            {value.iconName && (
              <Icon
                material={value.iconName}
                smallest
                className="mr-3" />
            )}
            {value.label}
          </div>

          <Map items={composite.children.filter(hasContent)}>
            {toNavigationHierarchy}
          </Map>
        </div>
      );
    }

    case "tab": {
      return <PreferencesNavigationTab tab={value} />;
    }

    case "preference-tabs-root": {
      return (
        <Map
          // Note: stricter typing for composite children could maybe remove this curiosity.
          items={composite.children.filter(hasContent) as Composite<PreferenceItemTypes>[]}
          getSeparator={value.childSeparator}
        >
          {toNavigationHierarchy}
        </Map>
      );
    }

    default: {
      throw checkThatAllDiscriminablesAreExhausted(value);
    }
  }
};

const hasContent = compositeHasDescendant<PreferenceItemTypes | PreferenceTabsRoot>(
  (composite) => composite.value.kind === "block",
);

const emptyRender = <></>;


