/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverrideForFunction } from "@k8slens/test-utils";
import requestPatchKubeResourceInjectable from "./request-patch-kube-resource.injectable";

export default getGlobalOverrideForFunction(requestPatchKubeResourceInjectable);
