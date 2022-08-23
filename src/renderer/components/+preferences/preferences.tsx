/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./preferences.scss";
import React from "react";

import { SettingLayout } from "../layout/setting-layout";
import { PreferencesNavigation } from "./preferences-navigation/preferences-navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import closePreferencesInjectable from "./close-preferences.injectable";

interface PreferencesProps extends React.DOMAttributes<any> {
  children: React.ReactNode;
}

interface Dependencies {
  closePreferences: () => void;
}

const NonInjectedPreferences = ({
  children,
  closePreferences,
  ...props
}: PreferencesProps & Dependencies) => (
  <SettingLayout
    navigation={<PreferencesNavigation />}
    className="Preferences"
    contentGaps={false}
    closeButtonProps={{ "data-testid": "close-preferences" }}
    back={closePreferences}
    {...props}
  >
    {children}
  </SettingLayout>
);

export const Preferences = withInjectables<Dependencies, PreferencesProps>(
  NonInjectedPreferences,

  {
    getProps: (di, props) => ({
      closePreferences: di.inject(closePreferencesInjectable),
      ...props,
    }),
  },
);

