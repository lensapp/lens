/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { HelmRepo } from "../../../../common/helm/helm-repo";
import loggerInjectable from "../../../../common/logger.injectable";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-helm-repository",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);
    const logger = di.inject(loggerInjectable);

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

      return await execHelm(...args);
    };
  },
});

export default addHelmRepositoryInjectable;
