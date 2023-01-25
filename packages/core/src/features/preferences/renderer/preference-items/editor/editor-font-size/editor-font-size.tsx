/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Input, InputValidators } from "../../../../../../renderer/components/input";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedEditorFontSize = observer(({ userStore: { editorConfiguration }}: Dependencies) => (
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

export const EditorFontSize = withInjectables<Dependencies>(
  NonInjectedEditorFontSize,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
