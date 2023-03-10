/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import openAppContextMenuInjectable from "./open-app-context-menu.injectable";
import { getGlobalOverrideForFunction } from "@k8slens/test-utils";

export default getGlobalOverrideForFunction(openAppContextMenuInjectable);
