/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

export const getDi = () => {
  const di = createContainer(
    getRequireContextForRendererCode,
    getRequireContextForCommonExtensionCode,
    getRequireContextForCommonCode,
  );

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  return di;
};

const getRequireContextForRendererCode = () =>
  require.context("./", true, /\.injectable\.(ts|tsx)$/);

const getRequireContextForCommonCode = () =>
  require.context("../common", true, /\.injectable\.(ts|tsx)$/);

const getRequireContextForCommonExtensionCode = () =>
  require.context("../extensions", true, /\.injectable\.(ts|tsx)$/);
