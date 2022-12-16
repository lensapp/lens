/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sortBy } from "lodash/fp";
import downloadJsonInjectable from "../../../../../../../common/fetch/download-json.injectable";
import { withTimeout } from "../../../../../../../common/fetch/timeout-controller";
import type { HelmRepo } from "../../../../../../../common/helm/helm-repo";
import loggerInjectable from "../../../../../../../common/logger.injectable";

const publicHelmReposUrl = "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json";

const requestPublicHelmRepositoriesInjectable = getInjectable({
  id: "request-public-helm-repositories",

  instantiate: (di) => {
    const downloadJson = di.inject(downloadJsonInjectable);
    const logger = di.inject(loggerInjectable);

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
