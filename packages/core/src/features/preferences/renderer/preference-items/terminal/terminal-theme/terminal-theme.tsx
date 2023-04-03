/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Select } from "../../../../../../renderer/components/select";
import type { LensTheme } from "../../../../../../renderer/themes/lens-theme";
import { lensThemeDeclarationInjectionToken } from "../../../../../../renderer/themes/declaration";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
  themes: LensTheme[];
}

const NonInjectedTerminalTheme = observer(({
  state,
  themes,
}: Dependencies) => {
  const themeOptions = [
    {
      value: "", // TODO: replace with a sentinel value that isn't string (and serialize it differently)
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
        value={state.terminalTheme}
        onChange={option => state.terminalTheme = option?.value ?? ""}
      />
    </section>
  );
},
);

export const TerminalTheme = withInjectables<Dependencies>(NonInjectedTerminalTheme, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    themes: di.injectMany(lensThemeDeclarationInjectionToken),
  }),
});
