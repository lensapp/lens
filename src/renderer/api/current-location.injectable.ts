/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export interface CurrentLocation {
  hostname: string;
  port: string;
  protocol: string;
}

const currentLocationInjectable = getInjectable({
  id: "current-location",
  instantiate: (): CurrentLocation => ({
    hostname: location.hostname,
    port: location.port,
    protocol: location.protocol,
  }),
  causesSideEffects: true,
});

export default currentLocationInjectable;
