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
import themeStoreInjectable from "../../../../../../renderer/themes/store.injectable";
import type { ThemeStore } from "../../../../../../renderer/themes/store";

interface Dependencies {
  userStore: UserStore;
  themeStore: ThemeStore;
}

const NonInjectedTerminalTheme = observer(
  ({ userStore, themeStore }: Dependencies) => {

    const themeOptions = [
      {
        value: "", // TODO: replace with a sentinal value that isn't string (and serialize it differently)
        label: "Match Lens Theme",
      },
      ...Array.from(themeStore.themes, ([themeId, { name }]) => ({
        value: themeId,
        label: name,
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

export const TerminalTheme = withInjectables<Dependencies>(
  NonInjectedTerminalTheme,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
      themeStore: di.inject(themeStoreInjectable),
    }),
  },
);
