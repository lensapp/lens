/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useState } from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../../../../../../../renderer/components/input";
import directoryForKubectlBinariesInjectable from "../../../../../../../common/app-paths/directory-for-kubectl-binaries/directory-for-kubectl-binaries.injectable";
import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
  defaultPathForKubectlBinaries: string;
}

const NonInjectedKubectlPathToBinary = observer(({
  state,
  defaultPathForKubectlBinaries,
}: Dependencies) => {
  const [binariesPath, setBinariesPath] = useState(state.kubectlBinariesPath || "");
  const pathValidator = binariesPath ? InputValidators.isPath : undefined;

  const save = () => {
    state.kubectlBinariesPath = binariesPath;
  };

  return (
    <section>
      <SubTitle title="Path to kubectl binary" />
      <Input
        theme="round-black"
        placeholder={defaultPathForKubectlBinaries}
        value={binariesPath}
        validators={pathValidator}
        onChange={setBinariesPath}
        onBlur={save}
        disabled={state.downloadKubectlBinaries}
      />
    </section>
  );
},
);

export const KubectlPathToBinary = withInjectables<Dependencies>(NonInjectedKubectlPathToBinary, {
  getProps: (di) => ({
    defaultPathForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
    state: di.inject(userPreferencesStateInjectable),
  }),
});
