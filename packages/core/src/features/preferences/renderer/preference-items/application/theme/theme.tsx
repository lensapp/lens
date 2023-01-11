/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { UserStore } from "../../../../../../common/user-store";
import type { LensTheme } from "../../../../../../renderer/themes/lens-theme";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import defaultLensThemeInjectable from "../../../../../../renderer/themes/default-theme.injectable";
import { lensThemeDeclarationInjectionToken } from "../../../../../../renderer/themes/declaration";

interface Dependencies {
  userStore: UserStore;
  defaultTheme: LensTheme;
  themes: LensTheme[];
}

const NonInjectedTheme = observer(({
  userStore,
  themes,
  defaultTheme,
}: Dependencies) => {
  const themeOptions = [
    {
      value: "system", // TODO: replace with a sentinal value that isn't string (and serialize it differently)
      label: "Sync with computer",
    },
    ...themes.map(theme => ({
      value: theme.name,
      label: theme.name,
    })),
  ];

  return (
    <section id="appearance">
      <SubTitle title="Theme" />
      <Select
        id="theme-input"
        options={themeOptions}
        value={userStore.colorTheme}
        onChange={(value) =>
          (userStore.colorTheme = value?.value ?? defaultTheme.name)
        }
        themeName="lens"
      />
    </section>
  );
});

export const Theme = withInjectables<Dependencies>(NonInjectedTheme, {
  getProps: (di) => ({
    userStore: di.inject(userStoreInjectable),
    defaultTheme: di.inject(defaultLensThemeInjectable),
    themes: di.injectMany(lensThemeDeclarationInjectionToken),
  }),
});
