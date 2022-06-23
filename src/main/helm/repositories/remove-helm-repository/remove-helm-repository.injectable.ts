/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { HelmRepo } from "../../../../common/helm/helm-repo";
import loggerInjectable from "../../../../common/logger.injectable";

const removeHelmRepositoryInjectable = getInjectable({
  id: "remove-helm-repository",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);
    const logger = di.inject(loggerInjectable);

    return async (repo: HelmRepo) => {
      logger.info(`[HELM]: removing repo ${repo.name} (${repo.url})`);

      return execHelm(
        "repo",
        "remove",
        repo.name,
      );
    };
  },
});

export default removeHelmRepositoryInjectable;
