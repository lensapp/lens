/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Kubectl } from "./kubectl";
import directoryForKubectlBinariesInjectable from "./directory-for-kubectl-binaries.injectable";
import userPreferencesStoreInjectable from "../../common/user-preferences/store.injectable";
import { bind } from "../../common/utils";

const createKubectlInjectable = getInjectable({
  instantiate: (di) => bind(Kubectl.create, null, {
    userStore: di.inject(userPreferencesStoreInjectable),
    directoryForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createKubectlInjectable;
