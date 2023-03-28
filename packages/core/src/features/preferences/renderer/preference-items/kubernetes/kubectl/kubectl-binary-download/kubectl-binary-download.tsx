/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Switch } from "../../../../../../../renderer/components/switch";
import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedKubectlBinaryDownload = observer(({ state }: Dependencies) => (
  <section>
    <SubTitle title="Kubectl binary download" />
    <Switch
      checked={state.downloadKubectlBinaries}
      onChange={() => state.downloadKubectlBinaries = !state.downloadKubectlBinaries}
    >
      Download kubectl binaries matching the Kubernetes cluster version
    </Switch>
  </section>
));

export const KubectlBinaryDownload = withInjectables<Dependencies>(NonInjectedKubectlBinaryDownload, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
