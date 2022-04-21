/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import type { UserStore } from "../../../common/user-store";
import { Select } from "../select";
import { Switch } from "../switch";
import { defaultPackageMirror, packageMirrors } from "../../../common/user-store/preferences-helpers";
import directoryForBinariesInjectable from "../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import directoryForKubectlBinariesInjectable from "../../../common/app-paths/directory-for-kubectl-binaries/directory-for-kubectl-binaries.injectable";

interface Dependencies {
  defaultPathForGeneralBinaries: string;
  defaultPathForKubectlBinaries: string;
  userStore: UserStore;
}
const downloadMirrorOptions = Array.from(packageMirrors, ([name, mirror]) => ({
  value: name,
  label: mirror.label,
  isDisabled: !mirror.platforms.has(process.platform),
}));

const NonInjectedKubectlBinaries= observer(({
  defaultPathForGeneralBinaries,
  defaultPathForKubectlBinaries,
  userStore,
}: Dependencies) => {
  const [downloadPath, setDownloadPath] = useState(userStore.downloadBinariesPath || "");
  const [binariesPath, setBinariesPath] = useState(userStore.kubectlBinariesPath || "");
  const pathValidator = downloadPath ? InputValidators.isPath : undefined;

  const save = () => {
    userStore.downloadBinariesPath = downloadPath;
    userStore.kubectlBinariesPath = binariesPath;
  };

  return (
    <>
      <section>
        <SubTitle title="Kubectl binary download" />
        <Switch
          checked={userStore.downloadKubectlBinaries}
          onChange={() => userStore.downloadKubectlBinaries = !userStore.downloadKubectlBinaries}
        >
          Download kubectl binaries matching the Kubernetes cluster version
        </Switch>
      </section>

      <section>
        <SubTitle title="Download mirror" />
        <Select
          id="download-mirror-input"
          placeholder="Download mirror for kubectl"
          options={downloadMirrorOptions}
          value={userStore.downloadMirror}
          onChange={option => userStore.downloadMirror = option?.value ?? defaultPackageMirror}
          isDisabled={!userStore.downloadKubectlBinaries}
          themeName="lens"
        />
      </section>

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
    </>
  );
},
);

export const KubectlBinaries = withInjectables<Dependencies>(
  NonInjectedKubectlBinaries,
  {
    getProps: (di) => ({
      defaultPathForGeneralBinaries: di.inject(directoryForBinariesInjectable),
      defaultPathForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
