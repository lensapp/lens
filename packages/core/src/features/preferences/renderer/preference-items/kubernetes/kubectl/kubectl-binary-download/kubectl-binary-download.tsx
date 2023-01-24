/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import { Switch } from "../../../../../../../renderer/components/switch";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedKubectlBinaryDownload = observer(({ userStore }: Dependencies) => (
  <section>
    <SubTitle title="Kubectl binary download" />
    <Switch
      checked={userStore.downloadKubectlBinaries}
      onChange={() => userStore.downloadKubectlBinaries = !userStore.downloadKubectlBinaries}
    >
      Download kubectl binaries matching the Kubernetes cluster version
    </Switch>
  </section>

));

export const KubectlBinaryDownload = withInjectables<Dependencies>(
  NonInjectedKubectlBinaryDownload,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
