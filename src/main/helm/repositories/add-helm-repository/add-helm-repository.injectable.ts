/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import type { AddHelmRepositoryChannel } from "../../../../common/helm/add-helm-repository-channel";
import type { RequestChannelHandler } from "../../../utils/channel/channel-listeners/listener-tokens";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-helm-repository",

  instantiate: (di): RequestChannelHandler<AddHelmRepositoryChannel> => {
    const execHelm = di.inject(execHelmInjectable);
    const logger = di.inject(loggerInjectable);

    return async (repo) => {
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
          callWasSuccessful: true,
        };
      }

      return {
        callWasSuccessful: false,
        error: result.error.stderr || result.error.message,
      };
    };
  },
});

export default addHelmRepositoryInjectable;
