/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import type { UpdateClusterModel } from "../../../common/cluster/types";
import { splitConfig } from "../../../common/kube-helpers";

export type ConfigToModels = (rootConfig: KubeConfig, filePath: string) => UpdateClusterModel[];

const configToModelsInjectable = getInjectable({
  id: "config-to-models",
  instantiate: (di): ConfigToModels => {
    const logger = di.inject(kubeconfigSyncLoggerInjectable);

    return (rootConfig, filePath) => {
      const validConfigs = [];

      for (const { config, error } of splitConfig(rootConfig)) {
        if (error) {
          logger.debug(`context failed validation: ${error}`, { context: config.currentContext, filePath });
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
