/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sortBy } from "lodash/fp";
import proxyDownloadJsonInjectable from "../../../../../../../common/fetch/download-json/proxy.injectable";
import { withTimeout } from "../../../../../../../common/fetch/timeout-controller";
import type { HelmRepo } from "../../../../../../../common/helm/helm-repo";
import { loggerInjectionToken } from "@k8slens/logger";

const publicHelmReposUrl = "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json";

const requestPublicHelmRepositoriesInjectable = getInjectable({
  id: "request-public-helm-repositories",

  instantiate: (di) => {
    const downloadJson = di.inject(proxyDownloadJsonInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (): Promise<HelmRepo[]> => {
      const controller = withTimeout(10_000);
      const result = await downloadJson(publicHelmReposUrl, {
        signal: controller.signal,
      });

      if (!result.callWasSuccessful) {
        logger.warn(`Failed to download public helm repos: ${result.error}`);

        return [];
      }

      return sortBy(repo => repo.name, result.response as HelmRepo[]);
    };
  },

  causesSideEffects: true,
});

export default requestPublicHelmRepositoriesInjectable;
