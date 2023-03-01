import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { runManySyncFor, runManyFor } from "@ogre-tools/injectable-utils";
import { beforeAnythingInjectionToken } from "./timeslots/before-anything-injection-token";
import {
  afterBeforeAnythingInjectionToken
} from "./timeslots/after-before-anything-injection-token";
import { untilReadyToStartInjectionToken } from "./triggers/until-ready-to-start-injection-token";
import {
  beforeApplicationIsLoadingInjectionToken
} from "./timeslots/before-application-is-loading-injection-token";
import { untilApplicationIsReadyToLoadInjectionToken } from "./triggers/until-application-is-ready-to-load-injection-token";
import {
  onLoadOfApplicationInjectionToken
} from "./timeslots/on-load-of-application-injection-token";
import {
  afterApplicationIsLoadedInjectionToken
} from "./timeslots/after-application-is-loaded-injection-token";
import { untilApplicationIsShownInjectionToken } from "./triggers/until-application-is-shown-injection-token";

export type StartApplication = () => void;

export const startApplicationInjectionToken =
  getInjectionToken<StartApplication>({
    id: "start-application-injection-token",
  });

const startApplicationInjectable = getInjectable({
  id: "start-application",

  instantiate: (di): StartApplication => {
    const untilReadyToStart = di.inject(untilReadyToStartInjectionToken);
    const untilApplicationIsReadyToLoad = di.inject(untilApplicationIsReadyToLoadInjectionToken);
    const untilApplicationIsShown = di.inject(untilApplicationIsShownInjectionToken);

    const runManyAsync = runManyFor(di)
    const runManySync = runManySyncFor(di)

    const beforeAnything = runManySync(
      beforeAnythingInjectionToken
    );

    const afterBeforeAnything = runManySync(
      afterBeforeAnythingInjectionToken
    );

    const beforeApplicationIsLoading = runManyAsync(
      beforeApplicationIsLoadingInjectionToken
    );

    const onLoadOfApplication = runManyAsync(onLoadOfApplicationInjectionToken);

    const afterApplicationIsLoaded = runManyAsync(
      afterApplicationIsLoadedInjectionToken
    );

    return async () => {
      beforeAnything();
      afterBeforeAnything();

      await untilReadyToStart()

      await beforeApplicationIsLoading();
      await untilApplicationIsReadyToLoad();

      await onLoadOfApplication();
      await untilApplicationIsShown();

      await afterApplicationIsLoaded();
    };
  },

  injectionToken: startApplicationInjectionToken,
});

export default startApplicationInjectable;
