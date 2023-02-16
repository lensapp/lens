/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionEventsInjectable from "./extension-events.injectable";

const waitForBundledExtensionsToBeLoadedInjectable = getInjectable({
  id: "wait-for-bundled-extensions-to-be-loaded",
  instantiate: (di) => {
    const extensionEvents = di.inject(extensionEventsInjectable);

    return () => new Promise<void>(resolve => extensionEvents.once("bundled-loaded", resolve));
  },
});

export default waitForBundledExtensionsToBeLoadedInjectable;
