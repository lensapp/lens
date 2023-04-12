import type { Feature } from "./feature";
export type FeatureContextMap = Map<Feature, {
    register: () => void;
    deregister: () => void;
    dependedBy: Map<Feature, number>;
    numberOfRegistrations: number;
}>;
export declare const featureContextMapInjectionToken: import("@ogre-tools/injectable").InjectionToken<FeatureContextMap, void>;
declare const featureContextMapInjectable: import("@ogre-tools/injectable").Injectable<FeatureContextMap, FeatureContextMap, void>;
export { featureContextMapInjectable };
