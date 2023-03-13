import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { getFeature } from "@k8slens/feature-core";

export const messagingFeatureForRenderer = getFeature({
  id: "messaging-for-renderer",

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,

      getRequireContexts: () => [
        require.context("./", true, /\.injectable\.(ts|tsx)$/),
      ],
    });
  },
});
