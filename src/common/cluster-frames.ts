/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";

export interface ClusterFrameInfo {
  frameId: number;
  processId: number
}

export const clusterFrameMap = observable.map<string, ClusterFrameInfo>();
