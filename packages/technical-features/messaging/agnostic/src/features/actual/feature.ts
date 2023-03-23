import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { applicationFeature } from "@k8slens/application";
import { getFeature } from "@k8slens/feature-core";

export const messagingFeature = getFeature({
  id: "messaging",

  dependencies: [applicationFeature],

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,

      getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
    });
  },
});
