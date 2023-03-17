/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Input, InputValidators } from "../../../../../../renderer/components/input";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedTabSize = observer(({ state: { editorConfiguration }}: Dependencies) => (
  <section>
    <SubTitle title="Tab size" />
    <Input
      theme="round-black"
      type="number"
      min={1}
      validators={InputValidators.isNumber}
      value={editorConfiguration.tabSize.toString()}
      onChange={value => editorConfiguration.tabSize = Number(value)}
    />
  </section>
));

export const TabSize = withInjectables<Dependencies>(NonInjectedTabSize, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
