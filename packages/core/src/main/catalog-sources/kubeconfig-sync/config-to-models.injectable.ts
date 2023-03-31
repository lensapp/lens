/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { UpdateClusterModel } from "../../../common/cluster-types";
import { splitConfig } from "../../../common/kube-helpers";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

export type ConfigToModels = (rootConfig: KubeConfig, filePath: string) => UpdateClusterModel[];

const configToModelsInjectable = getInjectable({
  id: "config-to-models",
  instantiate: (di): ConfigToModels => {
    const logger = di.inject(kubeconfigSyncLoggerInjectable);

    return (rootConfig, filePath) => {
      const validConfigs: ReturnType<ConfigToModels> = [];

      for (const { config, validationResult } of splitConfig(rootConfig)) {
        if (validationResult.error) {
          logger.debug(`context failed validation: ${validationResult.error}`, { context: config.currentContext, filePath });
        } else {
          validConfigs.push({
            kubeConfigPath: filePath,
            contextName: config.currentContext,
          });
        }
      }

      return validConfigs;
    };
  },
});

export default configToModelsInjectable;
