/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Select } from "../../../../../../renderer/components/select";
import { capitalize } from "lodash/fp";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import { defaultEditorConfig } from "../../../../../user-preferences/common/preferences-helpers";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const lineNumberOptions = ([
  "on",
  "off",
  "relative",
  "interval",
] as const).map(lineNumbers => ({
  value: lineNumbers,
  label: capitalize(lineNumbers),
}));

const NonInjectedLineNumbers = observer(({ state: { editorConfiguration }}: Dependencies) => (
  <section>
    <SubTitle title="Line numbers"/>
    <Select
      id="editor-line-numbers-input"
      options={lineNumberOptions}
      value={editorConfiguration.lineNumbers}
      onChange={option => editorConfiguration.lineNumbers = option?.value ?? defaultEditorConfig.lineNumbers}
      themeName="lens"
    />
  </section>
));

export const LineNumbers = withInjectables<Dependencies>(NonInjectedLineNumbers, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
