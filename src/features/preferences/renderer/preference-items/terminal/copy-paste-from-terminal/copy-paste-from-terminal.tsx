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
import { Switch } from "../../../../../../renderer/components/switch";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedCopyPasteFromTerminal = observer(
  ({ userStore }: Dependencies) => {

    return (
      <section id="terminalSelection">
        <SubTitle title="Terminal copy & paste" />
        <Switch
          checked={userStore.terminalCopyOnSelect}
          onChange={() => userStore.terminalCopyOnSelect = !userStore.terminalCopyOnSelect}
        >
          Copy on select and paste on right-click
        </Switch>
      </section>
    );
  },
);

export const CopyPasteFromTerminal = withInjectables<Dependencies>(
  NonInjectedCopyPasteFromTerminal,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
