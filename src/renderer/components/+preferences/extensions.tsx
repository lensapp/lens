/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import appPreferencesInjectable from "./app-preferences/app-preferences.injectable";
import { ExtensionSettings } from "./extension-settings";

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
}

const NonInjectedExtensions: React.FC<Dependencies> = ({ appPreferenceItems }) => {

  const settings = appPreferenceItems.get();

  return (
    <section id="extensions">
      <h2>Extensions</h2>
      {settings.filter(e => !e.showInPreferencesTab).map((setting) =>
        <ExtensionSettings key={setting.id} setting={setting} size="small" />,
      )}
    </section>
  );
};

export const Extensions = withInjectables<Dependencies>(
  observer(NonInjectedExtensions),

  {
    getProps: (di) => ({
      appPreferenceItems: di.inject(appPreferencesInjectable),
    }),
  },
);
