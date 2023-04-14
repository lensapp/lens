import { getFeature } from "@k8slens/feature-core";
import type { DiContainer } from "@ogre-tools/injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";

export const injectableMobXFeature = getFeature({
  id: "injectable-mobx",

  register: (di) => {
    registerMobX(di as DiContainer);
  },
});
