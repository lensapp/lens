/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { EmitterChannel } from "../../common/communication/emitter";

export type SetInstalling = EmitterChannel<[extId: string]>;

export const setInstallingChannel = "extension-installation-state-store:install";
export const setInstallingChannelInjectionToken = getInjectionToken<SetInstalling>();

export type ClearInstalling = EmitterChannel<[extId: string]>;

export const clearInstallingChannel = "extension-installation-state-store:clear-install";
export const clearInstallingChannelInjectionToken = getInjectionToken<ClearInstalling>();
