/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";
import { setupableInjectionToken } from "../common/setupable-injection-token/setupable-injection-token";

export const getDisForUnitTesting = ({ doGeneralOverrides } = { doGeneralOverrides: false }) => {
  const rendererDi = getRendererDi({ doGeneralOverrides });
  const mainDi = getMainDi({ doGeneralOverrides });

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: () => {
      const setupPromises = [
        ...rendererDi.injectMany(setupableInjectionToken),
        ...mainDi.injectMany(setupableInjectionToken),
      ].map(setupable => setupable.doSetup());

      return Promise.all([
        rendererDi.runSetups(),
        mainDi.runSetups(),
        ...setupPromises,
      ]);
    },
  };
};
