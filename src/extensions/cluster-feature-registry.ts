import { observable } from "mobx"
import { ClusterFeature } from "./cluster-feature";

export interface ClusterFeatureComponents {
  Description: React.ComponentType<any>;
}

export interface ClusterFeatureRegistration {
  title: string;
  components: ClusterFeatureComponents
  feature: ClusterFeature
}

export class ClusterFeatureRegistry {
  features = observable.array<ClusterFeatureRegistration>([], { deep: false });

  add(feature: ClusterFeatureRegistration) {
    this.features.push(feature)
    return () => {
      this.features.replace(
        this.features.filter(f => f !== feature)
      )
    };
  }
}

export const clusterFeatureRegistry = new ClusterFeatureRegistry()
