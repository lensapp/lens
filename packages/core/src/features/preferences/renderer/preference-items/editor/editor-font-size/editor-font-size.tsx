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

const NonInjectedEditorFontSize = observer(({ state: { editorConfiguration }}: Dependencies) => (
  <section>
    <SubTitle title="Font size" />
    <Input
      theme="round-black"
      type="number"
      min={10}
      validators={InputValidators.isNumber}
      value={editorConfiguration.fontSize.toString()}
      onChange={value => editorConfiguration.fontSize = Number(value)}
    />
  </section>
));

export const EditorFontSize = withInjectables<Dependencies>(NonInjectedEditorFontSize, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
