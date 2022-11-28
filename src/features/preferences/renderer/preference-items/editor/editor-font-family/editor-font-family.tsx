/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Input } from "../../../../../../renderer/components/input";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedEditorFontFamily = observer(({ userStore: { editorConfiguration }}: Dependencies) => (
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

export const EditorFontFamily = withInjectables<Dependencies>(
  NonInjectedEditorFontFamily,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
