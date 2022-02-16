/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import { ExtensionSettings } from "./extension-settings";
import { Preferences } from "./preferences";
import extensionsPreferenceItemsInjectable from "./extension-preference-items.injectable";

interface Dependencies {
  preferenceItems: IComputedValue<RegisteredAppPreference[]>;
}

const NonInjectedExtensions = ({ preferenceItems }: Dependencies) => (
  <Preferences data-testid="extension-preferences-page">
    <section id="extensions">
      <h2>Extensions</h2>
      {preferenceItems.get().map((preferenceItem) => (
        <ExtensionSettings
          key={preferenceItem.id}
          setting={preferenceItem}
          size="small"
          data-testid={`extension-preference-item-for-${preferenceItem.id}`}
        />
      ))}
    </section>
  </Preferences>
);

export const Extensions = withInjectables<Dependencies>(
  observer(NonInjectedExtensions),

  {
    getProps: (di) => ({
      preferenceItems: di.inject(extensionsPreferenceItemsInjectable),
    }),
  },
);
