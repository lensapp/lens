/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Input } from "../../../../../../renderer/components/input";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedEditorFontFamily = observer(({ state: { editorConfiguration }}: Dependencies) => (
  <section>
    <SubTitle title="Font family" />
    <Input
      theme="round-black"
      type="text"
      value={editorConfiguration.fontFamily}
      onChange={value => editorConfiguration.fontFamily = value}
    />
  </section>
));

export const EditorFontFamily = withInjectables<Dependencies>(NonInjectedEditorFontFamily, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
