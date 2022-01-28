/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { UserPreferencesStore } from "../../../common/user-preferences";
import { SubTitle } from "../layout/sub-title";
import { Input, InputValidators } from "../input";
import { isWindows } from "../../../common/vars";
import { Switch } from "../switch";
import { Select } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ThemeStore } from "../../themes/store";
import themeStoreInjectable from "../../themes/store.injectable";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";

export interface TerminalProps {}

const defaultShell = process.env.SHELL
  || process.env.PTYSHELL
  || (
    isWindows
      ? "powershell.exe"
      : "System default shell"
  );

interface Dependencies {
  userPreferencesStore: UserPreferencesStore;
  themeStore: ThemeStore;
}

const NonInjectedTerminal = observer(({ userPreferencesStore, themeStore }: Dependencies & TerminalProps) => (
  <div>
    <section id="shell">
      <SubTitle title="Terminal Shell Path"/>
      <Input
        theme="round-black"
        placeholder={defaultShell}
        value={userPreferencesStore.shell}
        onChange={(value) => userPreferencesStore.shell = value}
      />
    </section>

    <section id="terminalSelection">
      <SubTitle title="Terminal copy & paste" />
      <Switch
        checked={userPreferencesStore.terminalCopyOnSelect}
        onChange={() => userPreferencesStore.terminalCopyOnSelect = !userPreferencesStore.terminalCopyOnSelect}
      >
          Copy on select and paste on right-click
      </Switch>
    </section>

    <section id="terminalTheme">
      <SubTitle title="Terminal theme" />
      <Select
        themeName="lens"
        options={[
          { label: "Match theme", value: "" },
          ...themeStore.themeOptions,
        ]}
        value={userPreferencesStore.terminalTheme}
        onChange={({ value }) => userPreferencesStore.terminalTheme = value}
      />
    </section>

    <section>
      <SubTitle title="Font size"/>
      <Input
        theme="round-black"
        type="number"
        min={10}
        validators={InputValidators.isNumber}
        value={userPreferencesStore.terminalConfig.fontSize.toString()}
        onChange={(value) => userPreferencesStore.terminalConfig.fontSize=Number(value)}
      />
    </section>
    <section>
      <SubTitle title="Font family"/>
      <Input
        theme="round-black"
        type="text"
        value={userPreferencesStore.terminalConfig.fontFamily}
        onChange={(value) => userPreferencesStore.terminalConfig.fontFamily=value}
      />
    </section>
  </div>
));

export const Terminal = withInjectables<Dependencies, TerminalProps>(NonInjectedTerminal, {
  getProps: (di, props) => ({
    themeStore: di.inject(themeStoreInjectable),
    userPreferencesStore: di.inject(userPreferencesStoreInjectable),
    ...props,
  }),
});
