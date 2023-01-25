/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import { Select } from "../../../../../../renderer/components/select";
import type { LensTheme } from "../../../../../../renderer/themes/lens-theme";
import { lensThemeDeclarationInjectionToken } from "../../../../../../renderer/themes/declaration";

interface Dependencies {
  userStore: UserStore;
  themes: LensTheme[];
}

const NonInjectedTerminalTheme = observer(({
  userStore,
  themes,
}: Dependencies) => {

  const themeOptions = [
    {
      value: "", // TODO: replace with a sentinal value that isn't string (and serialize it differently)
      label: "Match Lens Theme",
    },
    ...themes.map(theme => ({
      value: theme.name,
      label: theme.name,
    })),
  ];

  return (
    <section id="terminalTheme">
      <SubTitle title="Terminal theme" />
      <Select
        id="terminal-theme-input"
        themeName="lens"
        options={themeOptions}
        value={userStore.terminalTheme}
        onChange={option => userStore.terminalTheme = option?.value ?? ""}
      />
    </section>
  );
},
);

export const TerminalTheme = withInjectables<Dependencies>(NonInjectedTerminalTheme, {
  getProps: (di) => ({
    userStore: di.inject(userStoreInjectable),
    themes: di.injectMany(lensThemeDeclarationInjectionToken),
  }),
});
