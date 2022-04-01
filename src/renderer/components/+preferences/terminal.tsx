/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { UserStore } from "../../../common/user-store";
import { SubTitle } from "../layout/sub-title";
import { Input, InputValidators } from "../input";
import { Switch } from "../switch";
import { Select } from "../select";
import { themeTypeOptions } from "../../themes/store";
import { Preferences } from "./preferences";
import { withInjectables } from "@ogre-tools/injectable-react";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import defaultShellInjectable from "./default-shell.injectable";

interface Dependencies {
  userStore: UserStore;
  defaultShell: string;
}

const NonInjectedTerminal = observer(({ userStore, defaultShell }: Dependencies) => {
  return (
    <Preferences data-testid="terminal-preferences-page">
      <section>
        <h2>Terminal</h2>

        <section id="shell">
          <SubTitle title="Terminal Shell Path" />
          <Input
            theme="round-black"
            placeholder={defaultShell}
            value={userStore.shell}
            onChange={(value) => userStore.shell = value}
          />
        </section>

        <section id="terminalSelection">
          <SubTitle title="Terminal copy & paste" />
          <Switch
            checked={userStore.terminalCopyOnSelect}
            onChange={() => userStore.terminalCopyOnSelect = !userStore.terminalCopyOnSelect}
          >
            Copy on select and paste on right-click
          </Switch>
        </section>

        <section id="terminalTheme">
          <SubTitle title="Terminal theme" />
          <Switch
            checked={userStore.terminalTheme.isGlobalThemeType}
            onChange={() => userStore.terminalTheme.isGlobalThemeType = !userStore.terminalTheme.isGlobalThemeType}
          >
            Sync terminal theme type with that of Lens
          </Switch>

          {
            !userStore.terminalTheme.isGlobalThemeType && (
              <Select
                id="terminal-theme-input"
                themeName="lens"
                options={themeTypeOptions}
                value={userStore.terminalTheme.type}
                onChange={({ value }) => userStore.terminalTheme.type = value}
              />
            )
          }
        </section>

        {/* Once other themes are supported add an option to sync those as well */}

        <section>
          <SubTitle title="Font size" />
          <Input
            theme="round-black"
            type="number"
            min={10}
            validators={InputValidators.isNumber}
            value={userStore.terminalConfig.fontSize.toString()}
            onChange={(value) => userStore.terminalConfig.fontSize = Number(value)}
          />
        </section>
        <section>
          <SubTitle title="Font family" />
          <Input
            theme="round-black"
            type="text"
            value={userStore.terminalConfig.fontFamily}
            onChange={(value) => userStore.terminalConfig.fontFamily = value}
          />
        </section>
      </section>
    </Preferences>
  );
});

export const Terminal = withInjectables<Dependencies>(NonInjectedTerminal, {
  getProps: (di) => ({
    userStore: di.inject(userStoreInjectable),
    defaultShell: di.inject(defaultShellInjectable),
  }),
});

