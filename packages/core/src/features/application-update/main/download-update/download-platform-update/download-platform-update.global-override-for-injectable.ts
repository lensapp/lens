/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverrideForFunction } from "@k8slens/test-utils";
import downloadPlatformUpdateInjectable from "./download-platform-update.injectable";

export default getGlobalOverrideForFunction(downloadPlatformUpdateInjectable);
