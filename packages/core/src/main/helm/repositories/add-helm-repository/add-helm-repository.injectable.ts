/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { HelmRepo } from "../../../../common/helm/helm-repo";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-helm-repository",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (repo: HelmRepo) => {
      const {
        name,
        url,
        insecureSkipTlsVerify,
        username,
        password,
        caFile,
        keyFile,
        certFile,
      } = repo;

      logger.info(`[HELM]: adding repo ${name} from ${url}`);

      const args = ["repo", "add", name, url];

      if (insecureSkipTlsVerify) {
        args.push("--insecure-skip-tls-verify");
      }

      if (username) {
        args.push("--username", username);
      }

      if (password) {
        args.push("--password", password);
      }

      if (caFile) {
        args.push("--ca-file", caFile);
      }

      if (keyFile) {
        args.push("--key-file", keyFile);
      }

      if (certFile) {
        args.push("--cert-file", certFile);
      }

      const result = await execHelm(args);

      if (result.callWasSuccessful) {
        return {
          callWasSuccessful: true as const,
        };
      }

      return {
        callWasSuccessful: false as const,
        error: result.error.stderr || result.error.message,
      };
    };
  },
});

export default addHelmRepositoryInjectable;
