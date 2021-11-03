/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState } from "react";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { getDefaultKubectlDownloadPath, UserStore } from "../../../common/user-store";
import { observer } from "mobx-react";
import { bundledKubectlPath } from "../../../main/kubectl";
import { SelectOption, Select } from "../select";
import { FormSwitch, Switcher } from "../switch";
import { packageMirrors } from "../../../common/user-store/preferences-helpers";

export const KubectlBinaries = observer(() => {
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
        <FormSwitch
          control={
            <Switcher
              checked={userStore.downloadKubectlBinaries}
              onChange={v => userStore.downloadKubectlBinaries = v.target.checked}
              name="kubectl-download"
            />
          }
          label="Download kubectl binaries matching the Kubernetes cluster version"
        />
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
          placeholder={getDefaultKubectlDownloadPath()}
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
          placeholder={bundledKubectlPath()}
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
