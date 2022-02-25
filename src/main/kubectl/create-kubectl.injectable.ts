/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Kubectl } from "./kubectl";
import directoryForKubectlBinariesInjectable from "./directory-for-kubectl-binaries/directory-for-kubectl-binaries.injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";

const createKubectlInjectable = getInjectable({
  id: "create-kubectl",

  instantiate: (di) => {
    const dependencies = {
      userStore: di.inject(userStoreInjectable),

      directoryForKubectlBinaries: di.inject(
        directoryForKubectlBinariesInjectable,
      ),
    };

    return (clusterVersion: string) =>
      new Kubectl(dependencies, clusterVersion);
  },
});

export default createKubectlInjectable;
