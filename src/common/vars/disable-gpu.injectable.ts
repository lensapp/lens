/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const hardwareAccelerationShouldBeDisabledInjectable = getInjectable({
  id: "hardware-acceleration-should-be-disabled",
  instantiate: () => Boolean(process.env.LENS_DISABLE_GPU),
  causesSideEffects: true,
});

export default hardwareAccelerationShouldBeDisabledInjectable;
