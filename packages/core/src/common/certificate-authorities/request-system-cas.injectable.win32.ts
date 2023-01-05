/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../fs/exec-file.injectable";
import loggerInjectable from "../logger.injectable";
import { requestSystemCAsInjectionToken } from "./request-system-cas-token";

const pemEncoding = (hexEncodedCert: String) => {
  const certData = Buffer.from(hexEncodedCert, "hex").toString("base64");
  const lines = ["-----BEGIN CERTIFICATE-----"];

  for (let i = 0; i < certData.length; i += 64) {
    lines.push(certData.substring(i, i + 64));
  }

  lines.push("-----END CERTIFICATE-----", "");

  return lines.join("\r\n");
};

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: (di) => {
    const wincaRootsExePath: string = __non_webpack_require__.resolve("win-ca/lib/roots.exe");
    const execFile = di.inject(execFileInjectable);
    const logger = di.inject(loggerInjectable);

    return async () => {
      /**
       * This needs to be done manually because for some reason calling the api from "win-ca"
       * directly fails to load "child_process" correctly on renderer
       */
      const result = await execFile(wincaRootsExePath, {
        maxBuffer: 128 * 1024 * 1024, // 128 MiB
      });

      if (!result.callWasSuccessful) {
        logger.warn(`[INJECT-CAS]: Error retreiving CAs`, result.error);

        return [];
      }

      return result
        .response
        .split("\r\n")
        .filter(Boolean)
        .map(pemEncoding);
    };
  },
  causesSideEffects: true,
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
