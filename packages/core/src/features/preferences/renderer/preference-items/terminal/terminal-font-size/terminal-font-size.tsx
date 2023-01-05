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
import { Input } from "../../../../../../renderer/components/input";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedTerminalFontSize = observer(
  ({ userStore }: Dependencies) => {

    return (
      <section>
        <SubTitle title="Font size" />
        <Input
          theme="round-black"
          type="number"
          min={10}
          max={50}
          defaultValue={userStore.terminalConfig.fontSize.toString()}
          onChange={(value) => userStore.terminalConfig.fontSize = Number(value)}
        />
      </section>
    );
  },
);

export const TerminalFontSize = withInjectables<Dependencies>(
  NonInjectedTerminalFontSize,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
