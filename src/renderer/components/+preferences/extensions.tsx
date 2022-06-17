/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import { extensionPreferencesModelInjectable } from "./extension-preference-model.injectable";
import { ExtensionSettings } from "./extension-settings";
import { Preferences } from "./preferences";

interface Dependencies {
  preferenceItems: RegisteredAppPreference[];
  extensionName: string;
}

const NonInjectedExtensions = ({ preferenceItems, extensionName }: Dependencies) => (
  <Preferences data-testid="extension-preferences-page">
    <section id="extensions">
      <h2>
        {extensionName}
        {" "}
        preferences
      </h2>
      {preferenceItems.map((preferenceItem, index) => (
        <ExtensionSettings
          key={`${preferenceItem.id}-${index}`}
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
    getProps: (di) => {
      const { preferenceItems, extensionName } = di.inject(extensionPreferencesModelInjectable).get();

      return {
        preferenceItems,
        extensionName,
      };
    },
  },
);
