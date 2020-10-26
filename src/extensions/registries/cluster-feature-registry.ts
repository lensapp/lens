import { BaseRegistry } from "./base-registry";
import { ClusterFeature } from "../cluster-feature";

export interface ClusterFeatureComponents {
  Description: React.ComponentType<any>;
}

export interface ClusterFeatureRegistration {
  title: string;
  components: ClusterFeatureComponents
  feature: ClusterFeature
}

export class ClusterFeatureRegistry extends BaseRegistry<ClusterFeatureRegistration> {}

export const clusterFeatureRegistry = new ClusterFeatureRegistry()
