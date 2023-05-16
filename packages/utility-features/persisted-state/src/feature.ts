import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { getFeature } from "@k8slens/feature-core";
import fsFeature from "@k8slens/file-system";
import loggingFeature from "@k8slens/logger";
import appPathsFeature from "@k8slens/app-paths";

export const feature = getFeature({
  id: "persisted-state",
  dependencies: [fsFeature, loggingFeature, appPathsFeature],

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,
      getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
    });
  },
});
