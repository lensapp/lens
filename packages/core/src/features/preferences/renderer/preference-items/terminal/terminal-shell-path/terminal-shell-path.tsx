/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Input } from "../../../../../../renderer/components/input";
import defaultShellInjectable from "./default-shell/default-shell.injectable";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
  defaultShell: string;
}

const NonInjectedTerminalShellPath = observer(({
  state,
  defaultShell,
}: Dependencies) => (
  <section id="shell">
    <SubTitle title="Terminal Shell Path" />
    <Input
      theme="round-black"
      placeholder={defaultShell}
      value={state.shell ?? ""}
      onChange={(value) => state.shell = value}
    />
  </section>
));

export const TerminalShellPath = withInjectables<Dependencies>(NonInjectedTerminalShellPath, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    defaultShell: di.inject(defaultShellInjectable),
  }),
});
