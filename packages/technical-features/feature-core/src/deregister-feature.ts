import type { DiContainer } from "@ogre-tools/injectable";
import type { Feature } from "./feature";
import { featureContextMapInjectable } from "./feature-context-map-injectable";

const getDependingFeaturesFor = (featureContextMap: Map<Feature, { dependedBy: Map<Feature, number> }>) => {
  const getDependingFeaturesForRecursion = (feature: Feature, atRoot = true): string[] => {
    const context = featureContextMap.get(feature);

    if (context?.dependedBy.size) {
      return [...context?.dependedBy.entries()].flatMap(([dependant]) =>
        getDependingFeaturesForRecursion(dependant, false),
      );
    }

    return atRoot ? [] : [feature.id];
  };

  return getDependingFeaturesForRecursion;
};

const deregisterFeatureRecursed = (di: DiContainer, feature: Feature, dependedBy?: Feature) => {
  const featureContextMap = di.inject(featureContextMapInjectable);

  const featureContext = featureContextMap.get(feature);

  if (!featureContext) {
    throw new Error(`Tried to deregister feature "${feature.id}", but it was not registered.`);
  }

  featureContext.numberOfRegistrations--;

  const getDependingFeatures = getDependingFeaturesFor(featureContextMap);

  const dependingFeatures = getDependingFeatures(feature);

  if (!dependedBy && dependingFeatures.length) {
    const names = dependingFeatures.join(", ");

    throw new Error(`Tried to deregister Feature "${feature.id}", but it is the dependency of Features "${names}"`);
  }

  if (dependedBy) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const oldNumberOfDependents = featureContext.dependedBy.get(dependedBy)!;
    const newNumberOfDependants = oldNumberOfDependents - 1;

    featureContext.dependedBy.set(dependedBy, newNumberOfDependants);

    if (newNumberOfDependants === 0) {
      featureContext.dependedBy.delete(dependedBy);
    }
  }

  if (featureContext.numberOfRegistrations === 0) {
    featureContextMap.delete(feature);

    featureContext.deregister();
  }

  feature.dependencies?.forEach((dependency) => {
    deregisterFeatureRecursed(di, dependency, feature);
  });
};

export const deregisterFeature = (di: DiContainer, ...features: Feature[]) => {
  features.forEach((feature) => {
    deregisterFeatureRecursed(di, feature);
  });
};
