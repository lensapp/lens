import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Feature } from "./feature";
import { featureContextMapInjectable, featureContextMapInjectionToken } from "./feature-context-map-injectable";
import { action, IComputedValue } from "mobx";
import { computed, observable } from "mobx";

export type FeatureAsd = {
  id: string;
  enabled: IComputedValue<boolean>;
  toggle: () => void;
};

export const featureInjectionToken = getInjectionToken<FeatureAsd>({
  id: "feature-injection-token",
});

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

  const featureAsdInjectable = getInjectable({
    id: `${feature.id}-feature`,

    instantiate: (di) => {
      const enabled = observable.box(true);

      const featureContext = di.inject(featureContextInjectable);

      return {
        id: feature.id,

        enabled: computed(() => {
          return enabled.get();
        }),

        toggle: action(() => {
          console.log("mikko", enabled.get());

          if (enabled.get()) {
            enabled.set(false);
            featureContext.deregister();
          } else {
            enabled.set(true);
            featureContext.register();
          }
        }),
      };
    },

    injectionToken: featureInjectionToken,
  });

  di.register(featureAsdInjectable);

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
