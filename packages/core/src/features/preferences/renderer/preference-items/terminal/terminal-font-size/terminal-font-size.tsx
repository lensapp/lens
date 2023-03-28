/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Input } from "../../../../../../renderer/components/input";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedTerminalFontSize = observer(({
  state,
}: Dependencies) => (
  <section>
    <SubTitle title="Font size" />
    <Input
      theme="round-black"
      type="number"
      min={10}
      max={50}
      defaultValue={state.terminalConfig.fontSize.toString()}
      onChange={(value) => state.terminalConfig.fontSize = Number(value)} />
  </section>
));

export const TerminalFontSize = withInjectables<Dependencies>(NonInjectedTerminalFontSize, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
