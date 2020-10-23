import { observable } from "mobx"
import { Feature } from "../main/feature";

export interface ClusterFeatureRegistration {
  title: string;
  description: string;
  feature: Feature
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
