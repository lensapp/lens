/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { GetRendererDiForUnitTestingOptions } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import type { GetMainDiForUnitTestingOptions } from "../main/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";

export interface GetDiForUnitTestingOptions {
  doGeneralOverrides?: boolean;
}

export const getDisForUnitTesting = (opts?: GetMainDiForUnitTestingOptions & GetRendererDiForUnitTestingOptions) => {
  const rendererDi = getRendererDi(opts);
  const mainDi = getMainDi(opts);

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: () => Promise.all([rendererDi.runSetups(), mainDi.runSetups()]),
  };
};
