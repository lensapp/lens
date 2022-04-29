/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting as getRendererDi } from "../renderer/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";
import { Volume } from "memfs";

export interface GetDisForUnitTestingOptions {
  doGeneralOverrides?: boolean;
}

export const getDisForUnitTesting = (opts: GetDisForUnitTestingOptions = {}) => {
  const memFsVolume = Volume.fromNestedJSON({
    "some-bin-directory": {},
    "some-directory-for-lens-local-storage": {},
    "some-electron-app-path-for-home": {},
    "some-electron-app-path-for-app-data": {},
    "some-electron-app-path-for-cache": {},
    "some-electron-app-path-for-temp": {},
    "some-electron-app-path-for-exe": {},
    "some-electron-app-path-for-module": {},
    "some-electron-app-path-for-desktop": {},
    "some-electron-app-path-for-documents": {},
    "some-electron-app-path-for-downloads": {},
    "some-electron-app-path-for-music": {},
    "some-electron-app-path-for-pictures": {},
    "some-electron-app-path-for-videos": {},
    "some-electron-app-path-for-logs": {},
    "some-electron-app-path-for-crash-dumps": {},
    "some-electron-app-path-for-crash-recent": {},
  }, "/");

  const rendererDi = getRendererDi({ ...opts, memFsVolume });
  const mainDi = getMainDi({ ...opts, memFsVolume });

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: () => Promise.all([rendererDi.runSetups(), mainDi.runSetups()]),
  };
};
