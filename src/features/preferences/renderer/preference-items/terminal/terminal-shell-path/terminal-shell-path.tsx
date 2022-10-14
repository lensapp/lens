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
import defaultShellInjectable from "./default-shell/default-shell.injectable";

interface Dependencies {
  userStore: UserStore;
  defaultShell: string;
}

const NonInjectedTerminalShellPath = observer(
  ({ userStore, defaultShell }: Dependencies) => {

    return (
      <section id="shell">
        <SubTitle title="Terminal Shell Path" />
        <Input
          theme="round-black"
          placeholder={defaultShell}
          value={userStore.shell ?? ""}
          onChange={(value) => userStore.shell = value}
        />
      </section>

    );
  },
);

export const TerminalShellPath = withInjectables<Dependencies>(
  NonInjectedTerminalShellPath,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
      defaultShell: di.inject(defaultShellInjectable),
    }),
  },
);
