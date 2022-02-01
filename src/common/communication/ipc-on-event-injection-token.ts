/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export type IpcOnEvent = (channel: string, ...args: any[]) => void;

export const ipcOnEventInjectionToken = getInjectionToken<IpcOnEvent>();
