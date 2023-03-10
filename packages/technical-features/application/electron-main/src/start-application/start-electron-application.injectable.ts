import {
  DiContainer,
  getInjectable,
  instantiationDecoratorToken,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import { startApplicationInjectionToken } from "@k8slens/application";
import whenAppIsReadyInjectable from "./when-app-is-ready.injectable";
import { beforeAnythingInjectionToken, beforeElectronIsReadyInjectionToken } from "./time-slots";
import { runManySyncFor } from "@k8slens/run-many";

type ToBeDecorated = (di: DiContainer, ...args: unknown[]) => (...args: unknown[]) => unknown;

const startElectronApplicationInjectable = getInjectable({
  id: "start-electron-application",

  instantiate: () => ({
    decorate: (toBeDecorated: unknown) => (
      (di: DiContainer, ...args: unknown[]) => {
        const whenAppIsReady = di.inject(whenAppIsReadyInjectable);
        const runManySync = runManySyncFor(di);
        const beforeAnything = runManySync(beforeAnythingInjectionToken);
        const beforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
        const startApplication = (toBeDecorated as ToBeDecorated)(di, ...args);

        return (...startApplicationArgs: unknown[]) => {
          beforeAnything();
          beforeElectronIsReady();

          return (async () => {
            await whenAppIsReady();

            return startApplication(...startApplicationArgs);
          })()
        };
      }
    ),
    target: startApplicationInjectionToken,
  }),

  decorable: false,

  injectionToken: instantiationDecoratorToken,

  lifecycle: lifecycleEnum.singleton,
});

export default startElectronApplicationInjectable;
