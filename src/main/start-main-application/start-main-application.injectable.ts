/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  getInjectable,
} from "@ogre-tools/injectable";

import electronAppInjectable from "../app-paths/get-electron-app-path/electron-app/electron-app.injectable";
import { beforeApplicationIsReadyInjectionToken } from "./before-application-is-ready/before-application-is-ready-injection-token";
import { onApplicationIsReadyInjectionToken } from "./on-application-is-ready/on-application-is-ready-injection-token";
import { onSecondApplicationInstanceInjectionToken } from "./on-second-application-instance/on-second-application-instance-injection-token";
import { onApplicationActivationInjectionToken } from "./on-application-activation/on-application-activation-injection-token";
import { onOpenOfUrlInjectionToken } from "./on-open-of-url/on-open-of-url-injection-token";
import { runManyFor } from "./run-many-for";
import {
  onApplicationCloseInjectionToken,
} from "./on-application-close/on-application-close-injection-token";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const app = di.inject(electronAppInjectable);

    const runManyBeforeApplicationIsReady = runMany(
      beforeApplicationIsReadyInjectionToken,
    );

    const runManyAfterApplicationIsReady = runMany(
      onApplicationIsReadyInjectionToken,
    );

    const runManyForSecondApplicationInstance = runMany(
      onSecondApplicationInstanceInjectionToken,
    );

    const runManyForApplicationActivation = runMany(
      onApplicationActivationInjectionToken,
    );

    const runManyForApplicationClose = runMany(onApplicationCloseInjectionToken);

    const runManyForOpenOfUrl = runMany(onOpenOfUrlInjectionToken);

    return async () => {
      app.on("second-instance", async (_, commandLineArguments) => {
        await runManyForSecondApplicationInstance({ commandLineArguments });
      });

      app.on("activate", async (_, hasVisibleWindows) => {
        await runManyForApplicationActivation({ hasVisibleWindows });
      });

      app.on("will-quit", async (event) => {
        await runManyForApplicationClose({ event });
      });

      app.on("open-url", async (event, url) => {
        await runManyForOpenOfUrl({ event, url });
      });

      await runManyBeforeApplicationIsReady();

      await app.whenReady();

      await runManyAfterApplicationIsReady();
    };
  },
});

export default startMainApplicationInjectable;



