/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Select } from "../../../../../../renderer/components/select";
import { defaultEditorConfig } from "../../../../../../common/user-store/preferences-helpers";
import { capitalize } from "lodash/fp";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
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

const NonInjectedLineNumbers = observer(({ userStore: { editorConfiguration }}: Dependencies) => (
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

export const LineNumbers = withInjectables<Dependencies>(
  NonInjectedLineNumbers,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
