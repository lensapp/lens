import { getFeature } from "@k8slens/feature-core";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { applicationFeature } from "@k8slens/application";

export const applicationFeatureForElectronMain = getFeature({
  id: "application-for-electron-main",

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,

      getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
    });
  },

  dependencies: [applicationFeature],
});
