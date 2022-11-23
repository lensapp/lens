/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";

const execHelmEnvInjectable = getInjectable({
  id: "exec-helm-env",
  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);

    return computed(() => {
      const {
        HTTPS_PROXY = userStore.httpsProxy,
        ...env
      } = process.env;

      return { HTTPS_PROXY, ...env } as Partial<Record<string, string>>;
    });
  },
  causesSideEffects: true,
});

export default execHelmEnvInjectable;
