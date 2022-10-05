/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const defaultEnterDurationForAnimatedInjectable = getInjectable({
  id: "default-enter-duration-for-animated",
  instantiate: () => 100,
});

export default defaultEnterDurationForAnimatedInjectable;
