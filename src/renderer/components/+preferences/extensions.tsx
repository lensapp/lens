/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import extensionPreferencesModelInjectable from "./extension-preference-model.injectable";
import { ExtensionSettings } from "./extension-settings";
import { Preferences } from "./preferences";

interface Dependencies {
  model: IComputedValue<{
    preferenceItems: RegisteredAppPreference[];
    extensionName?: string;
    preferencePageTitle?: string;
  }>;
}

const NonInjectedExtensions = ({ model }: Dependencies) => {
  const { extensionName, preferenceItems, preferencePageTitle } = model.get();

  return (
    <Preferences data-testid="extension-preferences-page">
      <section id="extensions">
        <h2 data-testid="extension-preferences-page-title">
          {preferencePageTitle}
        </h2>
        {!extensionName && (
          <div
            className="flex items-center"
            data-testid="error-for-extension-not-being-present"
          >
            No extension found
          </div>
        )}
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
};

export const Extensions = withInjectables<Dependencies>(
  observer(NonInjectedExtensions),

  {
    getProps: (di) => ({
      model: di.inject(extensionPreferencesModelInjectable),
    }),
  },
);
