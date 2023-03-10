import { getFeature } from "@k8slens/feature-core";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";

export const applicationFeature = getFeature({
  id: "application",

  register: (di) => {
    autoRegister({
      di,
      targetModule: module,

      getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
    });
  },
});
