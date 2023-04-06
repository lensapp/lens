import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { Feature } from "./feature";
import { featureContextMapInjectable, featureContextMapInjectionToken } from "./feature-context-map-injectable";

const createFeatureContext = (feature: Feature, di: DiContainer) => {
  const featureContextInjectable = getInjectable({
    id: feature.id,

    instantiate: (diForContextOfFeature) => ({
      register: () => {
        feature.register(diForContextOfFeature);
      },

      deregister: () => {
        diForContextOfFeature.deregister(featureContextInjectable);
      },

      dependedBy: new Map<Feature, number>(),

      numberOfRegistrations: 0,
    }),

    scope: true,
  });

  di.register(featureContextInjectable);

  const featureContextMap = di.inject(featureContextMapInjectable);
  const featureContext = di.inject(featureContextInjectable);

  featureContextMap.set(feature, featureContext);

  return featureContext;
};

const registerFeatureRecursed = (di: DiContainer, feature: Feature, dependedBy?: Feature) => {
  const featureContextMaps = di.injectMany(featureContextMapInjectionToken);

  if (featureContextMaps.length === 0) {
    di.register(featureContextMapInjectable);
  }

  const featureContextMap = di.inject(featureContextMapInjectable);

  const existingFeatureContext = featureContextMap.get(feature);

  if (!dependedBy && existingFeatureContext && existingFeatureContext.dependedBy.size === 0) {
    throw new Error(`Tried to register feature "${feature.id}", but it was already registered.`);
  }

  const featureContext = existingFeatureContext || createFeatureContext(feature, di);

  featureContext.numberOfRegistrations++;

  if (dependedBy) {
    const oldNumberOfDependents = featureContext.dependedBy.get(dependedBy) || 0;
    const newNumberOfDependents = oldNumberOfDependents + 1;

    featureContext.dependedBy.set(dependedBy, newNumberOfDependents);
  }

  if (!existingFeatureContext) {
    featureContext.register();
  }

  feature.dependencies?.forEach((dependency) => {
    registerFeatureRecursed(di, dependency, feature);
  });
};

export const registerFeature = (di: DiContainer, ...features: Feature[]) => {
  features.forEach((feature) => {
    registerFeatureRecursed(di, feature);
  });
};
