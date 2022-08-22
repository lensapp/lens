/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../fs/exec-file.injectable";
import loggerInjectable from "../logger.injectable";
import { requestSystemCAsInjectionToken } from "./request-system-cas-token";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet#other_assertions
const certSplitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: (di) => {
    const execFile = di.inject(execFileInjectable);
    const logger = di.inject(loggerInjectable);

    const execSecurity = async (...args: string[]) => {
      const output = await execFile("/usr/bin/security", args);

      return output.split(certSplitPattern);
    };

    return async () => {
      try {
        const [trusted, rootCA] = await Promise.all([
          execSecurity("find-certificate", "-a", "-p"),
          execSecurity("find-certificate", "-a", "-p", "/System/Library/Keychains/SystemRootCertificates.keychain"),
        ]);

        return [...new Set([...trusted, ...rootCA])];
      } catch (error) {
        logger.warn(`[INJECT-CAS]: Error injecting root CAs from MacOSX: ${error}`);
      }

      return [];
    };
  },
  causesSideEffects: true,
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
