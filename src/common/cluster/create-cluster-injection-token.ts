/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterModel } from "../cluster-types";
import type { Cluster } from "./cluster";

export const createClusterInjectionToken = getInjectionToken<(model: ClusterModel) => Cluster>();
