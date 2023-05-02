/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { HelmRepo } from "../../../../common/helm/helm-repo";
import { loggerInjectionToken } from "@k8slens/logger";
import type { AsyncResult } from "@k8slens/utilities";

const removeHelmRepositoryInjectable = getInjectable({
  id: "remove-helm-repository",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (repo: HelmRepo): AsyncResult<void, string> => {
      logger.info(`[HELM]: removing repo ${repo.name} (${repo.url})`);

      const result = await execHelm([
        "repo",
        "remove",
        repo.name,
      ]);

      if (result.callWasSuccessful) {
        return {
          callWasSuccessful: true,
        };
      }

      return {
        callWasSuccessful: false,
        error: result.error.stderr,
      };
    };
  },
});

export default removeHelmRepositoryInjectable;
