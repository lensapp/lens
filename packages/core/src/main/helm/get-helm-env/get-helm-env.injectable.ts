/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../exec-helm/exec-helm.injectable";
import type { AsyncResult } from "@k8slens/utilities";

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
};

const getHelmEnvInjectable = getInjectable({
  id: "get-helm-env",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);

    return async (): AsyncResult<HelmEnv> => {
      const result = await execHelm(["env"]);

      if (!result.callWasSuccessful) {
        return { callWasSuccessful: false, error: result.error.stderr };
      }

      const lines = result.response.split(/\r?\n/); // split by new line feed
      const env: HelmEnv = {};

      lines.forEach((line: string) => {
        const [key, value] = line.split("=");

        if (key && value) {
          env[key] = value.replace(/"/g, ""); // strip quotas
        }
      });

      return { callWasSuccessful: true, response: env };
    };
  },
});

export default getHelmEnvInjectable;
