/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import wincaAPI from "win-ca/api";
import { requestSystemCAsInjectionToken } from "./request-system-cas-token";

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: () => {
    return () => new Promise<string[]>((resolve) => {
      const CAs: string[] = [];

      wincaAPI({
        format: wincaAPI.der2.pem,
        inject: false,
        ondata: (ca: string) => {
          CAs.push(ca);
        },
        onend: () => {
          resolve(CAs);
        },
      });
    });
  },
  causesSideEffects: true,
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
