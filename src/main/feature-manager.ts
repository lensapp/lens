import { ContextHandler } from "./context-handler"
import logger from "./logger";
import { Cluster } from "./cluster";
import { Feature, FeatureStatusMap } from "./feature"
import { MetricsFeature } from "../features/metrics"
import { UserModeFeature } from "../features/user-mode"

const ALL_FEATURES: any = {
  'metrics': new MetricsFeature(null),
  'user-mode': new UserModeFeature(null),
}

export async function getFeatures(clusterContext: ContextHandler): Promise<FeatureStatusMap> {
  return new Promise<FeatureStatusMap>(async (resolve, reject) => {
    const result: FeatureStatusMap = {};
    logger.debug(`features for ${clusterContext.contextName}`);
    for (const key in ALL_FEATURES) {
      logger.debug(`feature ${key}`);
      if (ALL_FEATURES.hasOwnProperty(key)) {
        logger.debug("getting feature status...");
        const feature = ALL_FEATURES[key] as Feature;

        const status = await feature.featureStatus(clusterContext.kc);
        result[feature.name] = status

      } else {
        logger.error("ALL_FEATURES.hasOwnProperty(key) returned FALSE ?!?!?!?!")

      }
    }
    logger.debug(`getFeatures resolving with features: ${JSON.stringify(result)}`);
    resolve(result);
  });
}


export async function installFeature(name: string, cluster: Cluster, config: any) {
  const feature = ALL_FEATURES[name] as Feature
  // TODO Figure out how to handle config stuff
  await feature.install(cluster)
}

export async function upgradeFeature(name: string, cluster: Cluster, config: any) {
  const feature = ALL_FEATURES[name] as Feature
  // TODO Figure out how to handle config stuff
  await feature.upgrade(cluster)
}

export async function uninstallFeature(name: string, cluster: Cluster) {
  const feature = ALL_FEATURES[name] as Feature

  await feature.uninstall(cluster)
}
