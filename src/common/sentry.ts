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

import { Dedupe, Offline } from "@sentry/integrations";
import * as Sentry from "@sentry/electron";
import { sentryDsn, isProduction } from "./vars";
import { UserStore } from "./user-store";
import { inspect } from "util";

/**
 * "Translate" 'browser' to 'main' as Lens developer more familiar with the term 'main'
 */
function mapProcessName(processType: string) {
  if (processType === "browser") {
    return "main";
  }

  return processType;
}

/**
 * Initialize Sentry for the current process so to send errors for debugging.
 */
export function SentryInit() {
  const processName = mapProcessName(process.type);

  Sentry.init({
    beforeSend: (event) => {
      // default to false, in case instance of UserStore is not created (yet)
      const allowErrorReporting = UserStore.getInstance(false)?.allowErrorReporting ?? false;

      if (allowErrorReporting) {
        return event;
      }

      /**
       * Directly write to stdout so that no other integrations capture this and create an infinite loop
       */
      process.stdout.write(`🔒  [SENTRY-BEFORE-SEND-HOOK]: allowErrorReporting: ${allowErrorReporting}. Sentry event is caught but not sent to server.`);
      process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
      process.stdout.write(inspect(event, false, null, true));
      process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

      // if return null, the event won't be sent
      // ref https://github.com/getsentry/sentry-javascript/issues/2039
      return null;
    },
    dsn: sentryDsn,
    integrations: [
      new Dedupe(),
      new Offline(),
    ],
    initialScope: {
      tags: {
        "process": processName,
      },
    },
    environment: isProduction ? "production" : "development",
  });
}
