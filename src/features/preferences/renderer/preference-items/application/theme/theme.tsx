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
import type { ThemeStore } from "../../../../../../renderer/themes/store";
import { defaultThemeId } from "../../../../../../common/vars";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import themeStoreInjectable from "../../../../../../renderer/themes/store.injectable";

interface Dependencies {
  userStore: UserStore;
  themeStore: ThemeStore;
}

const NonInjectedTheme = observer(({ userStore, themeStore }: Dependencies) => {
  const themeOptions = [
    {
      value: "system", // TODO: replace with a sentinal value that isn't string (and serialize it differently)
      label: "Sync with computer",
    },
    ...Array.from(themeStore.themes, ([themeId, { name }]) => ({
      value: themeId,
      label: name,
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
          (userStore.colorTheme = value?.value ?? defaultThemeId)
        }
        themeName="lens"
      />
    </section>
  );
});

export const Theme = withInjectables<Dependencies>(
  NonInjectedTheme,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
      themeStore: di.inject(themeStoreInjectable),
    }),
  },
);
