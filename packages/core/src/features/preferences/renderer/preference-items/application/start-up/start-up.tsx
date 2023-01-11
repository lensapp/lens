/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { Switch } from "../../../../../../renderer/components/switch";
import { observer } from "mobx-react";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedStartUp = observer(({ userStore }: Dependencies) => (
  <section id="other">
    <SubTitle title="Start-up" />
    <Switch
      checked={userStore.openAtLogin}
      onChange={() => (userStore.openAtLogin = !userStore.openAtLogin)}
    >
      Automatically start Lens on login
    </Switch>
  </section>
));

export const StartUp = withInjectables<Dependencies>(
  NonInjectedStartUp,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
