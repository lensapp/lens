/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { CaptureConsole, Dedupe, Offline } from "@sentry/integrations";
import { sentryDsn, isProduction } from "./vars";
import { UserStore } from "./user-store";
import logger from "../main/logger";

export let sentryIsInitialized = false;

/**
 * This function bypasses webpack issues.
 *
 * See: https://docs.sentry.io/platforms/javascript/guides/electron/#webpack-configuration
 */
async function requireSentry() {
  switch (process.type) {
    case "browser":
      return import("@sentry/electron/dist/main");
    case "renderer":
      return import("@sentry/electron/dist/renderer");
    default:
      throw new Error(`Unsupported process type ${process.type}`);
  }
}

/**
 * Initialize Sentry for the current process so to send errors for debugging.
 */
export async function SentryInit(): Promise<void> {
  try {
    const Sentry = await requireSentry();

    try {
      Sentry.init({
        beforeSend: event => {
          if (UserStore.getInstance().allowErrorReporting) {
            return event;
          }

          logger.info(`🔒  [SENTRY-BEFORE-SEND-HOOK]: allowErrorReporting: false. Sentry event is caught but not sent to server.`);
          logger.info("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
          logger.info(event);
          logger.info("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

          // if return null, the event won't be sent
          // ref https://github.com/getsentry/sentry-javascript/issues/2039
          return null;
        },
        dsn: sentryDsn,
        integrations: [
          new CaptureConsole({ levels: ["error"] }),
          new Dedupe(),
          new Offline()
        ],
        initialScope: {
          tags: {
            // "translate" browser to 'main' as Lens developer more familiar with the term 'main'
            "process": process.type === "browser" ? "main" : "renderer"
          }
        },
        environment: isProduction ? "production" : "development",
      });

      sentryIsInitialized = true;

      logger.info(`✔️  [SENTRY-INIT]: Sentry for ${process.type} is initialized.`);
    } catch (error) {
      logger.warn(`⚠️  [SENTRY-INIT]: Sentry.init() error: ${error?.message ?? error}.`);
    }
  } catch (error) {
    logger.warn(`⚠️  [SENTRY-INIT]: Error loading Sentry module ${error?.message ?? error}.`);
  }
}
