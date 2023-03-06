import {
  DiContainer,
  getInjectable,
  instantiationDecoratorToken,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import { startApplicationInjectionToken } from "@k8slens/application";
import whenAppIsReadyInjectable from "./when-app-is-ready.injectable";
import { beforeAnythingInjectionToken } from "./timeslots/before-anything-injection-token";
import { beforeElectronIsReadyInjectionToken } from "./timeslots/before-electron-is-ready-injection-token";
import { runManySyncFor } from "@k8slens/run-many";

const startElectronApplicationInjectable = getInjectable({
  id: "start-electron-application",

  instantiate: () => ({
    decorate:
      (toBeDecorated: unknown) =>
      (di: DiContainer, ...args: unknown[]) => {
        const whenAppIsReady = di.inject(whenAppIsReadyInjectable);
        const runManySync = runManySyncFor(di);
        const beforeAnything = runManySync(beforeAnythingInjectionToken);
        const beforeElectronIsReady = runManySync(
          beforeElectronIsReadyInjectionToken
        );

        const typedToBeDecorated = toBeDecorated as (
          di: DiContainer,
          ...args: unknown[]
        ) => unknown;

        const startApplication = typedToBeDecorated(di, ...args) as (
          ...args: unknown[]
        ) => unknown;

        return (...startApplicationArgs: unknown[]) => {
          beforeAnything();
          beforeElectronIsReady();

          return (async () => {
            await whenAppIsReady();

            return startApplication(...startApplicationArgs);
          })()
        };
      },

    target: startApplicationInjectionToken,
  }),

  decorable: false,

  injectionToken: instantiationDecoratorToken,

  lifecycle: lifecycleEnum.singleton,
});

export default startElectronApplicationInjectable;
