import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { runManyFor } from "@k8slens/run-many";
import { beforeApplicationIsLoadingInjectionToken } from "./timeslots/before-application-is-loading-injection-token";
import { onLoadOfApplicationInjectionToken } from "./timeslots/on-load-of-application-injection-token";
import { afterApplicationIsLoadedInjectionToken } from "./timeslots/after-application-is-loaded-injection-token";

export type StartApplication = () => Promise<void>;

export const startApplicationInjectionToken =
  getInjectionToken<StartApplication>({
    id: "start-application-injection-token",
  });

const startApplicationInjectable = getInjectable({
  id: "start-application",

  instantiate: (di): StartApplication => {
    const runManyAsync = runManyFor(di)

    const beforeApplicationIsLoading = runManyAsync(
      beforeApplicationIsLoadingInjectionToken
    );

    const onLoadOfApplication = runManyAsync(onLoadOfApplicationInjectionToken);

    const afterApplicationIsLoaded = runManyAsync(
      afterApplicationIsLoadedInjectionToken
    );

    return async () => {
      await beforeApplicationIsLoading();

      await onLoadOfApplication();

      await afterApplicationIsLoaded();
    };
  },

  injectionToken: startApplicationInjectionToken,
});

export default startApplicationInjectable;
