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
import type { Event as SentryEvent } from "@sentry/types";
import { sentryDsn, isProduction } from "./vars";
import { UserStore } from "./user-store";
import logger from "../main/logger";

// https://www.electronjs.org/docs/api/process#processtype-readonly
type ElectronProcessType = "browser" | "renderer" | "worker";

const processType = process.type as ElectronProcessType;

export const integrations = [
  new CaptureConsole({ levels: ["error"] }),
  new Dedupe(),
  new Offline()
];

const initialScope = {
  tags: {
    // "translate" browser to 'main' as Lens developer more familiar with the term 'main'
    "process": processType === "browser" ? "main" : "renderer"
  }
};

const environment = isProduction ? "production" : "development";

function logInitError(reason: string) {
  logger.warn(`⚠️  [SENTRY-INIT]: ${reason}, Sentry is not initialized.`);
}

function beforeSend(event: SentryEvent) {
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
}

async  function requireSentry() {
  if (processType === "browser") {
    return import("@sentry/electron/dist/main");
  }

  if (processType === "renderer") {
    return import("@sentry/electron/dist/renderer");
  }

  throw new Error(`Unsupported process type ${processType}`);
}

export async function SentryInit() {
  try {
    const Sentry = await requireSentry();

    try {
      Sentry.init({
        beforeSend,
        dsn: sentryDsn,
        integrations,
        initialScope,
        environment
      });
      logger.info(`✔️  [SENTRY-INIT]: Sentry for ${processType} is initialized.`);
    } catch (error) {
      return logInitError(`Sentry.init() error ${error?.message}`);
    }
  } catch (error) {
    return logInitError(`Error loading Sentry module ${error?.message ?? error}`);
  }
}
