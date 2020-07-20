import { KubeConfig } from "@kubernetes/client-node"
import logger from "./logger";
import { Cluster } from "./cluster";
import { Feature, FeatureStatusMap, FeatureMap } from "./feature"
import { MetricsFeature } from "../features/metrics"
import { UserModeFeature } from "../features/user-mode"

const ALL_FEATURES: Map<string, Feature> = new Map([
  [MetricsFeature.id, new MetricsFeature(null)],
  [UserModeFeature.id, new UserModeFeature(null)],
]);

export async function getFeatures(cluster: Cluster): Promise<FeatureStatusMap> {
  const result: FeatureStatusMap = {};
  logger.debug(`features for ${cluster.contextName}`);

  for (const [key, feature] of ALL_FEATURES) {
    logger.debug(`feature ${key}`);
    logger.debug("getting feature status...");

    const kc = new KubeConfig();
    kc.loadFromFile(cluster.getProxyKubeconfigPath());

    result[feature.name] = await feature.featureStatus(kc);
  }

  logger.debug(`getFeatures resolving with features: ${JSON.stringify(result)}`);
  return result;
}


export async function installFeature(name: string, cluster: Cluster, config: any): Promise<void> {
  // TODO Figure out how to handle config stuff
  return ALL_FEATURES.get(name).install(cluster)
}

export async function upgradeFeature(name: string, cluster: Cluster, config: any): Promise<void> {
  // TODO Figure out how to handle config stuff
  return ALL_FEATURES.get(name).upgrade(cluster)
}

export async function uninstallFeature(name: string, cluster: Cluster): Promise<void> {
  return ALL_FEATURES.get(name).uninstall(cluster)
}
