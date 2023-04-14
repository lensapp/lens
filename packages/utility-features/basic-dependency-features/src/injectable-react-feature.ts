import { getFeature } from "@k8slens/feature-core";
import type { DiContainer } from "@ogre-tools/injectable";
import { registerInjectableReact } from "@ogre-tools/injectable-react";

export const injectableReactFeature = getFeature({
  id: "injectable-react",

  register: (di) => {
    registerInjectableReact(di as DiContainer);
  },
});
