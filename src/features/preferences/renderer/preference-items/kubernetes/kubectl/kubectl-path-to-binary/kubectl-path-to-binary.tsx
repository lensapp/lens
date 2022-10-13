/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useState } from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../../../../../../../renderer/components/input";
import directoryForKubectlBinariesInjectable from "../../../../../../../common/app-paths/directory-for-kubectl-binaries/directory-for-kubectl-binaries.injectable";

interface Dependencies {
  userStore: UserStore;
  defaultPathForKubectlBinaries: string;
}

const NonInjectedKubectlPathToBinary = observer(
  ({ userStore, defaultPathForKubectlBinaries }: Dependencies) => {
    const [binariesPath, setBinariesPath] = useState(userStore.kubectlBinariesPath || "");
    const pathValidator = binariesPath ? InputValidators.isPath : undefined;

    const save = () => {
      userStore.kubectlBinariesPath = binariesPath;
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
          disabled={userStore.downloadKubectlBinaries}
        />
      </section>
    );
  },
);

export const KubectlPathToBinary = withInjectables<Dependencies>(
  NonInjectedKubectlPathToBinary,

  {
    getProps: (di) => ({
      defaultPathForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
