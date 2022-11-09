/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { registerFeature } from "@lensapp/feature-core";
import type { DiContainer } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import testFeature from "@lensapp/test-feature";

export default (di: DiContainer) => {
  runInAction(() => {
    registerFeature(di, testFeature);
  });
};
