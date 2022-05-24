/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";

export interface GetDiForUnitTestingOptions {
  doGeneralOverrides?: boolean;
}

export const getDisForUnitTesting = (opts?: GetDiForUnitTestingOptions) => {
  const rendererDi = getRendererDi(opts);
  const mainDi = getMainDi(opts);

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
  };
};
