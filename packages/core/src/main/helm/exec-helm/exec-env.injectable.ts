/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import httpsProxyConfigurationInjectable from "../../../features/user-preferences/common/https-proxy.injectable";

const execHelmEnvInjectable = getInjectable({
  id: "exec-helm-env",
  instantiate: (di) => {
    const httpsProxyConfiguration = di.inject(httpsProxyConfigurationInjectable);

    return computed(() => {
      const {
        HTTPS_PROXY = httpsProxyConfiguration.get(),
        ...env
      } = process.env;

      return { HTTPS_PROXY, ...env } as Partial<Record<string, string>>;
    });
  },
  causesSideEffects: true,
});

export default execHelmEnvInjectable;
