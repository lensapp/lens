/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../fs/exec-file.injectable";
import loggerInjectable from "../logger.injectable";
import type { AsyncResult } from "../utils/async-result";
import { requestSystemCAsInjectionToken } from "./request-system-cas-token";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet#other_assertions
const certSplitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: (di) => {
    const execFile = di.inject(execFileInjectable);
    const logger = di.inject(loggerInjectable);

    const execSecurity = async (...args: string[]): Promise<AsyncResult<string[]>> => {
      const result = await execFile("/usr/bin/security", args);

      if (!result.callWasSuccessful) {
        return {
          callWasSuccessful: false,
          error: result.error.stderr || result.error.message,
        };
      }

      return {
        callWasSuccessful: true,
        response: result.response.split(certSplitPattern),
      };
    };

    return async () => {
      const [trustedResult, rootCAResult] = await Promise.all([
        execSecurity("find-certificate", "-a", "-p"),
        execSecurity("find-certificate", "-a", "-p", "/System/Library/Keychains/SystemRootCertificates.keychain"),
      ]);

      if (!trustedResult.callWasSuccessful) {
        logger.warn(`[INJECT-CAS]: Error retreiving trusted CAs: ${trustedResult.error}`);
      } else if (!rootCAResult.callWasSuccessful) {
        logger.warn(`[INJECT-CAS]: Error retreiving root CAs: ${rootCAResult.error}`);
      } else {
        return [...new Set([...trustedResult.response, ...rootCAResult.response])];
      }

      return [];
    };
  },
  causesSideEffects: true,
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
