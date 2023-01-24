/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import { Select } from "../../../../../../../renderer/components/select";
import { defaultPackageMirror, packageMirrors } from "../../../../../../../common/user-store/preferences-helpers";

interface Dependencies {
  userStore: UserStore;
}

const downloadMirrorOptions = Array.from(packageMirrors, ([name, mirror]) => ({
  value: name,
  label: mirror.label,

  // TODO: Side-effect
  isDisabled: !mirror.platforms.has(process.platform),
}));


const NonInjectedKubectlDownloadMirror = observer(({ userStore }: Dependencies) => (
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
));

export const KubectlDownloadMirror = withInjectables<Dependencies>(
  NonInjectedKubectlDownloadMirror,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
