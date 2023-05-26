import { getInjectable } from "@ogre-tools/injectable";
import { reactApplicationChildrenInjectionToken } from "@k8slens/react-application";
import { computed, IComputedValue } from "mobx";
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { featureInjectionToken } from "@k8slens/feature-core";
import { observer } from "mobx-react";
import type { FeatureAsd } from "@k8slens/feature-core";
import { installFeaturesInjectable } from "./install-features.injectable";

interface Dependencies {
  features: IComputedValue<FeatureAsd[]>;
  installFeatures: (event: any) => Promise<void>;
}

const NonInjectedRuntimeFeaturesPreferences = observer(({ features, installFeatures }: Dependencies) => (
  <div
    style={{
      height: "500px",
      width: "500px",
      backgroundColor: "red",
      color: "white",
      position: "absolute",
      top: 0,
      padding: "80px",
      zIndex: 9999,
    }}
  >
    <h2>Features</h2>
    <ul>
      {features.get().map((x) => (
        <li key={x.id}>
          {x.id} <input type="checkbox" checked={x.enabled.get()} onChange={x.toggle} />
        </li>
      ))}
    </ul>

    <hr />

    <div>
      Register new feature
      <input type="file" onChange={installFeatures} />
    </div>
  </div>
));

export const RuntimeFeaturesPreferences = withInjectables<Dependencies>(
  NonInjectedRuntimeFeaturesPreferences,

  {
    getProps: (di) => {
      const computedInjectMany = di.inject(computedInjectManyInjectable);

      return {
        features: computedInjectMany(featureInjectionToken),
        installFeatures: di.inject(installFeaturesInjectable),
      };
    },
  },
);

export const runtimeFeaturesPreferencesInjectable = getInjectable({
  id: "runtime-features-preferences",

  instantiate: () => ({
    id: "runtime-feature-preferences",
    Component: RuntimeFeaturesPreferences,
    enabled: computed(() => true),
  }),

  injectionToken: reactApplicationChildrenInjectionToken,
});
