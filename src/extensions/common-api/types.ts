/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
export type IpcRendererEvent = Electron.IpcRendererEvent;
export type IpcMainEvent = Electron.IpcMainEvent;
export type { LensExtension, LensExtensionManifest, LensExtensionId } from "../lens-extension";
export type { InstalledExtension } from "../extension-discovery/extension-discovery";
export type { Disposer } from "../../common/utils";

export {
  ItemStore,
} from "../../common/item.store";
export type {
  ItemObject,
} from "../../common/item.store";

export * from "./registrations";
