import React, { useState } from "react";
import { Checkbox } from "../checkbox";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";
import { UserPreferences, userStore } from "../../../common/user-store";
import { observer } from "mobx-react";
import { bundledKubectlPath } from "../../../main/kubectl";
import { SelectOption, Select } from "../select";

export const KubectlBinaries = observer(({ preferences }: { preferences: UserPreferences }) => {
  const [downloadPath, setDownloadPath] = useState(preferences.downloadBinariesPath || "");
  const [binariesPath, setBinariesPath] = useState(preferences.kubectlBinariesPath || "");
  const pathValidator = downloadPath ? InputValidators.isPath : undefined;

  const downloadMirrorOptions: SelectOption<string>[] = [
    { value: "default", label: "Default (Google)" },
    { value: "china", label: "China (Azure)" },
  ];

  const save = () => {
    preferences.downloadBinariesPath = downloadPath;
    preferences.kubectlBinariesPath = binariesPath;
  };

  return (
    <>
      <SubTitle title="Automatic kubectl binary download"/>
      <Checkbox
        label="Download kubectl binaries matching the Kubernetes cluster version"
        value={preferences.downloadKubectlBinaries}
        onChange={downloadKubectlBinaries => preferences.downloadKubectlBinaries = downloadKubectlBinaries}
      />
      <SubTitle title="Download mirror" />
      <Select
        placeholder="Download mirror for kubectl"
        options={downloadMirrorOptions}
        value={preferences.downloadMirror}
        onChange={({ value }: SelectOption) => preferences.downloadMirror = value}
        disabled={!preferences.downloadKubectlBinaries}
      />
      <SubTitle title="Directory for binaries" />
      <Input
        theme="round-black"
        value={downloadPath}
        placeholder={userStore.getDefaultKubectlPath()}
        validators={pathValidator}
        onChange={setDownloadPath}
        onBlur={save}
        disabled={!preferences.downloadKubectlBinaries}
      />
      <small className="hint">
        The directory to download binaries into.
      </small>
      <SubTitle title="Path to kubectl binary" />
      <Input
        theme="round-black"
        placeholder={bundledKubectlPath()}
        value={binariesPath}
        validators={pathValidator}
        onChange={setBinariesPath}
        onBlur={save}
        disabled={preferences.downloadKubectlBinaries}
      />
      <small className="hint">
        The path to the kubectl binary on the system.
      </small>
    </>
  );
});
