/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useState } from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Input, InputValidators } from "../../../../../../../renderer/components/input";
import directoryForBinariesInjectable from "../../../../../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
  defaultPathForGeneralBinaries: string;
}

const NonInjectedKubectlDirectoryForBinaries = observer(
  ({ state, defaultPathForGeneralBinaries }: Dependencies) => {
    const [downloadPath, setDownloadPath] = useState(state.downloadBinariesPath || "");
    const pathValidator = downloadPath ? InputValidators.isPath : undefined;

    const save = () => {
      state.downloadBinariesPath = downloadPath;
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
          disabled={!state.downloadKubectlBinaries}
        />
        <div className="hint">The directory to download binaries into.</div>
      </section>
    );
  },
);

export const KubectlDirectoryForBinaries = withInjectables<Dependencies>(NonInjectedKubectlDirectoryForBinaries, {
  getProps: (di) => ({
    defaultPathForGeneralBinaries: di.inject(directoryForBinariesInjectable),
    state: di.inject(userPreferencesStateInjectable),
  }),
});
