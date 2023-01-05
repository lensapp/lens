/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as Catalog from "./catalog";
import * as Navigation from "./navigation";
import * as K8sApi from "./k8s-api";
import * as Power from "./power";
import { IpcMain as Ipc } from "../ipc/ipc-main";
import { LensMainExtension as LensExtension } from "../lens-main-extension";

export {
  Catalog,
  Navigation,
  K8sApi,
  Ipc,
  LensExtension,
  Power,
};
