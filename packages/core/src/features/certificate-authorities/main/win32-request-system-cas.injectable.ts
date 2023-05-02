/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../../../common/fs/exec-file.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { platformSpecificRequestSystemCAsInjectionToken } from "../common/request-system-cas-token";

const pemEncoding = (hexEncodedCert: String) => {
  const certData = Buffer.from(hexEncodedCert, "hex").toString("base64");
  const lines = ["-----BEGIN CERTIFICATE-----"];

  for (let i = 0; i < certData.length; i += 64) {
    lines.push(certData.substring(i, i + 64));
  }

  lines.push("-----END CERTIFICATE-----", "");

  return lines.join("\r\n");
};

const win32RequestSystemCAsInjectable = getInjectable({
  id: "win32-request-system-cas",
  instantiate: (di) => ({
    platform: "win32" as const,
    instantiate: () => {
      const winCARootsExePath: string = __non_webpack_require__.resolve("win-ca/lib/roots.exe");
      const execFile = di.inject(execFileInjectable);
      const logger = di.inject(loggerInjectionToken);

      return async () => {
      /**
       * This needs to be done manually because for some reason calling the api from "win-ca"
       * directly fails to load "child_process" correctly on renderer
       */
        const result = await execFile(winCARootsExePath, {
          maxBuffer: 128 * 1024 * 1024, // 128 MiB
        });

        if (!result.callWasSuccessful) {
          logger.warn(`[INJECT-CAS]: Error retrieving CAs`, result.error);

          return [];
        }

        return result
          .response
          .split("\r\n")
          .filter(Boolean)
          .map(pemEncoding);
      };
    },
  }),
  causesSideEffects: true,
  injectionToken: platformSpecificRequestSystemCAsInjectionToken,
});

export default win32RequestSystemCAsInjectable;
