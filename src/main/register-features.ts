/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { registerFeature } from "@lensapp/feature-core";
import clusterFeature from "@lensapp/cluster";
import fsFeature from "@lensapp/fs";
import loggingFeature from "@lensapp/logging";
import shellFeature from "@lensapp/shell";
import type { DiContainer } from "@ogre-tools/injectable";
import { action } from "mobx";

export default action((di: DiContainer) => {
  registerFeature(di, clusterFeature);
  registerFeature(di, fsFeature);
  registerFeature(di, loggingFeature);
  registerFeature(di, shellFeature);
});

