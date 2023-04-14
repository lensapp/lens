import { getFeature } from "@k8slens/feature-core";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { injectableMobXFeature, injectableReactFeature } from "@k8slens/basic-dependency-features";

export const dockFeature = getFeature({
  id: "dock",

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,
      getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
    });
  },

  dependencies: [injectableReactFeature, injectableMobXFeature],
});
