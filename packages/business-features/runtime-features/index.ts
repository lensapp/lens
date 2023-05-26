import { getInjectionToken } from "@ogre-tools/injectable";
export { runtimeFeaturesFeature } from "./src/feature";

export { mikkoFeature } from "./src/mikko-feature";

export const requireInjectionToken = getInjectionToken<any>({
  id: "require-injection-token",
});
