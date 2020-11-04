import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { isPath } from '../input/input_validators';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { SubTitle } from '../layout/sub-title';
import { UserPreferences, userStore } from '../../../common/user-store';
import { observer } from 'mobx-react';
import { bundledKubectlPath } from '../../../main/kubectl';
import { SelectOption, Select } from '../select';

export const KubectlBinaries = observer(({ preferences }: { preferences: UserPreferences }) => {
  const [downloadPath, setDownloadPath] = useState(preferences.downloadBinariesPath || "");
  const [binariesPath, setBinariesPath] = useState(preferences.kubectlBinariesPath || "");

  const downloadMirrorOptions: SelectOption<string>[] = [
    { value: "default", label: "Default (Google)" },
    { value: "china", label: "China (Azure)" },
  ]

  const save = () => {
    preferences.downloadBinariesPath = downloadPath;
    preferences.kubectlBinariesPath = binariesPath;
  }

  return (
    <>
      <h2><Trans>Kubectl Binary</Trans></h2>
      <Checkbox
        label={<Trans>Download kubectl binaries</Trans>}
        value={preferences.downloadKubectlBinaries}
        onChange={downloadKubectlBinaries => preferences.downloadKubectlBinaries = downloadKubectlBinaries}
      />
      <small className="hint">
        <Trans>Download kubectl binaries matching to Kubernetes cluster version.</Trans>
      </small>
      <SubTitle title="Download mirror" />
      <Select
        placeholder={<Trans>Download mirror for kubectl</Trans>}
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
        validators={isPath}
        onChange={setDownloadPath}
        onBlur={save}
        disabled={!preferences.downloadKubectlBinaries}
      />
      <small className="hint">
        The directory to download binaries into.
      </small>
      <SubTitle title="Path to Kubectl binary" />
      <Input
        theme="round-black"
        placeholder={bundledKubectlPath()}
        value={binariesPath}
        validators={isPath}
        onChange={setBinariesPath}
        onBlur={save}
        disabled={preferences.downloadKubectlBinaries}
      />
      <small className="hint">
        <Trans>The path to the kubectl binary on the system.</Trans>
      </small>
    </>
  );
});
