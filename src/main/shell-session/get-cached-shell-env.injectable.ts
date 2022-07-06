/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import cachedShellEnvInjectable from "./cached-shell-env.injectable";
import type { GetShellEnv } from "./get-shell-env.injectable";
import getShellEnvInjectable from "./get-shell-env.injectable";

const getCachedShellEnvInjectable = getInjectable({
  id: "get-cached-shell-env",
  instantiate: (di): GetShellEnv => {
    const cachedShellEnv = di.inject(cachedShellEnvInjectable);
    const getShellEnv = di.inject(getShellEnvInjectable);

    return async (args) => {
      const { id: clusterId } = args.cluster;

      let env = cachedShellEnv.get(clusterId);

      if (!env) {
        env = await getShellEnv(args);
        cachedShellEnv.set(clusterId, env);
      } else {
        // refresh env in the background
        getShellEnv(args).then((shellEnv) => {
          cachedShellEnv.set(clusterId, shellEnv);
        });
      }

      return env;
    };
  },
});

export default getCachedShellEnvInjectable;
