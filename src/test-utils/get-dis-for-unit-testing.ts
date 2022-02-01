/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";

interface DiForTestingOptions {
  doGeneralOverrides?: boolean;
}

export async function getDisForUnitTesting({ doGeneralOverrides = false }: DiForTestingOptions = {}) {
  const rendererDi = await getRendererDi({
    doGeneralOverrides,
    doIpcOverrides: false,
  });
  const mainDi = await getMainDi({
    doGeneralOverrides,
    doIpcOverrides: false,
  });

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: async () => {
      await mainDi.runSetups();
      await rendererDi.runSetups();
    },
  };
}
