/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { UserStore } from "../../../common/user-store";
import { SelectOption, Select } from "../select";
import { Switch } from "../switch";
import { packageMirrors } from "../../../common/user-store/preferences-helpers";
import directoryForBinariesInjectable from "../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { kubectlBinaryPath } from "../../../common/vars";

interface Dependencies {
  defaultPathForKubectlBinaries: string;
}

const NonInjectedKubectlBinaries: React.FC<Dependencies> = observer(({ defaultPathForKubectlBinaries }) => {
  const userStore = UserStore.getInstance();
  const [downloadPath, setDownloadPath] = useState(userStore.downloadBinariesPath || "");
  const [binariesPath, setBinariesPath] = useState(userStore.kubectlBinariesPath || "");
  const pathValidator = downloadPath ? InputValidators.isPath : undefined;
  const downloadMirrorOptions: SelectOption<string>[] = Array.from(
    packageMirrors.entries(),
    ([value, { label, platforms }]) => ({ value, label, platforms }),
  );

  const save = () => {
    userStore.downloadBinariesPath = downloadPath;
    userStore.kubectlBinariesPath = binariesPath;
  };

  return (
    <>
      <section>
        <SubTitle title="Kubectl binary download"/>
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
          placeholder="Download mirror for kubectl"
          options={downloadMirrorOptions}
          value={userStore.downloadMirror}
          onChange={({ value }: SelectOption) => userStore.downloadMirror = value}
          disabled={!userStore.downloadKubectlBinaries}
          isOptionDisabled={({ platforms }) => !platforms.has(process.platform)}
          themeName="lens"
        />
      </section>

      <section>
        <SubTitle title="Directory for binaries" />
        <Input
          theme="round-black"
          value={downloadPath}
          placeholder={defaultPathForKubectlBinaries}
          validators={pathValidator}
          onChange={setDownloadPath}
          onBlur={save}
          disabled={!userStore.downloadKubectlBinaries}
        />
        <div className="hint">
          The directory to download binaries into.
        </div>
      </section>

      <section>
        <SubTitle title="Path to kubectl binary" />
        <Input
          theme="round-black"
          placeholder={kubectlBinaryPath.get()}
          value={binariesPath}
          validators={pathValidator}
          onChange={setBinariesPath}
          onBlur={save}
          disabled={userStore.downloadKubectlBinaries}
        />
      </section>
    </>
  );
});

export const KubectlBinaries = withInjectables<Dependencies>(NonInjectedKubectlBinaries, {
  getProps: (di) => ({
    defaultPathForKubectlBinaries: di.inject(directoryForBinariesInjectable),
  }),
});
