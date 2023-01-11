/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ElectronMainOptions } from "@sentry/electron/main";
import type { BrowserOptions } from "@sentry/electron/renderer";
import isProductionInjectable from "../vars/is-production.injectable";
import sentryDataSourceNameInjectable from "../vars/sentry-dsn-url.injectable";
import { Dedupe, Offline } from "@sentry/integrations";
import { inspect } from "util";
import userStoreInjectable from "../user-store/user-store.injectable";

export type InitializeSentryReportingWith = (initSentry: (opts: BrowserOptions | ElectronMainOptions) => void) => void;

const mapProcessName = (type: "browser" | "renderer" | "worker") => type === "browser" ? "main" : type;

const initializeSentryReportingWithInjectable = getInjectable({
  id: "initialize-sentry-reporting-with",
  instantiate: (di): InitializeSentryReportingWith => {
    const sentryDataSourceName = di.inject(sentryDataSourceNameInjectable);
    const isProduction = di.inject(isProductionInjectable);
    const userStore = di.inject(userStoreInjectable);

    if (!sentryDataSourceName) {
      return () => {};
    }

    return (initSentry) => initSentry({
      beforeSend: (event) => {
        if (userStore.allowErrorReporting) {
          return event;
        }

        /**
         * Directly write to stdout so that no other integrations capture this and create an infinite loop
         */
        process.stdout.write(`🔒  [SENTRY-BEFORE-SEND-HOOK]: Sentry event is caught but not sent to server.`);
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
        process.stdout.write(inspect(event, false, null, true));
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

        // if return null, the event won't be sent
        // ref https://github.com/getsentry/sentry-javascript/issues/2039
        return null;
      },
      dsn: sentryDataSourceName,
      integrations: [
        new Dedupe(),
        new Offline(),
      ],
      initialScope: {
        tags: {
          "process": mapProcessName(process.type),
        },
      },
      environment: isProduction ? "production" : "development",
    });
  },
  causesSideEffects: true,
});

export default initializeSentryReportingWithInjectable;
