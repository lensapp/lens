import { ContextHandler } from "./context-handler";
import logger from "./logger";
import { Cluster } from "./cluster";
import { Feature, FeatureStatusMap } from "./feature";
import { MetricsFeature } from "../features/metrics";
import { UserModeFeature } from "../features/user-mode";

const ALL_FEATURES: Record<string, Feature> = {
  'metrics': new MetricsFeature(null),
  'user-mode': new UserModeFeature(null),
};

export async function getFeatures(clusterContext: ContextHandler): Promise<FeatureStatusMap> {
  return new Promise<FeatureStatusMap>(async (resolve, _reject) => {
    const result: FeatureStatusMap = {};
    logger.debug(`features for ${clusterContext.contextName}`);
    for (const key in ALL_FEATURES) {
      logger.debug(`feature ${key}`);
      if (ALL_FEATURES.hasOwnProperty(key)) {
        logger.debug("getting feature status...");
        result[ALL_FEATURES[key].name] = await ALL_FEATURES[key].featureStatus(clusterContext.kc);
      } else {
        logger.error("ALL_FEATURES.hasOwnProperty(key) returned FALSE ?!?!?!?!");
      }
    }
    logger.debug(`getFeatures resolving with features: ${JSON.stringify(result)}`);
    resolve(result);
  });
}


export async function installFeature(name: string, cluster: Cluster, _config: any): Promise<void> {
  // TODO Figure out how to handle config stuff
  await ALL_FEATURES[name].install(cluster);
}

export async function upgradeFeature(name: string, cluster: Cluster, _config: any): Promise<void> {
  // TODO Figure out how to handle config stuff
  await ALL_FEATURES[name].upgrade(cluster);
}

export async function uninstallFeature(name: string, cluster: Cluster): Promise<void> {
  await ALL_FEATURES[name].uninstall(cluster);
}
