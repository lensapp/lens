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
import directoryForBinariesInjectable from "../../../../../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";

interface Dependencies {
  userStore: UserStore;
  defaultPathForGeneralBinaries: string;
}

const NonInjectedKubectlDirectoryForBinaries = observer(
  ({ userStore, defaultPathForGeneralBinaries }: Dependencies) => {
    const [downloadPath, setDownloadPath] = useState(userStore.downloadBinariesPath || "");
    const pathValidator = downloadPath ? InputValidators.isPath : undefined;

    const save = () => {
      userStore.downloadBinariesPath = downloadPath;
    };

    return (
      <section>
        <SubTitle title="Directory for binaries" />
        <Input
          theme="round-black"
          value={downloadPath}
          placeholder={defaultPathForGeneralBinaries}
          validators={pathValidator}
          onChange={setDownloadPath}
          onBlur={save}
          disabled={!userStore.downloadKubectlBinaries}
        />
        <div className="hint">The directory to download binaries into.</div>
      </section>
    );
  },
);

export const KubectlDirectoryForBinaries = withInjectables<Dependencies>(
  NonInjectedKubectlDirectoryForBinaries,

  {
    getProps: (di) => ({
      defaultPathForGeneralBinaries: di.inject(directoryForBinariesInjectable),
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
