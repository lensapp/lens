import type React from "react"
import { BaseRegistry, BaseRegistryItem } from "./base-registry";
import { ClusterFeature } from "../cluster-feature";

export interface ClusterFeatureComponents {
  Description: React.ComponentType<any>;
}

export interface ClusterFeatureRegistration extends BaseRegistryItem {
  title: string;
  components: ClusterFeatureComponents
  feature: ClusterFeature
}

export class ClusterFeatureRegistry extends BaseRegistry<ClusterFeatureRegistration> {
}

export const clusterFeatureRegistry = new ClusterFeatureRegistry()
