import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Feature } from "./feature";

export type FeatureContextMap = Map<
  Feature,
  {
    register: () => void;
    deregister: () => void;
    dependedBy: Map<Feature, number>;
    numberOfRegistrations: number;
  }
>;

export const featureContextMapInjectionToken = getInjectionToken<FeatureContextMap>({
  id: "feature-context-map-injection-token",
});

const featureContextMapInjectable = getInjectable({
  id: "feature-store",

  instantiate: (): FeatureContextMap => new Map(),

  injectionToken: featureContextMapInjectionToken,
});

export { featureContextMapInjectable };
