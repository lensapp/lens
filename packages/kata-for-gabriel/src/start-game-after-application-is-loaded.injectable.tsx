import { getInjectable } from "@ogre-tools/injectable";
import { gameInjectable } from "./monster-beatdown.injectable";
import { afterApplicationIsLoadedInjectionToken } from "@k8slens/application";

const startGameAfterApplicationIsLoadedInjectable = getInjectable({
  id: "start-game-after-application-is-loaded",

  instantiate: (di) => ({
    run: () => {
      di.inject(gameInjectable).start();
    },
  }),

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default startGameAfterApplicationIsLoadedInjectable;
