/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { delay } from "../../../../common/utils";
import waitForBundledExtensionsToBeLoadedInjectable from "../../../../features/extensions/loader/main/wait-for-bundled-loaded.injectable";

const waitUntilBundledExtensionsAreLoadedInjectable = getInjectable({
  id: "wait-until-bundled-extensions-are-loaded",

  instantiate: (di) => {
    const waitForBundledExtensionsToBeLoaded = di.inject(waitForBundledExtensionsToBeLoadedInjectable);

    return async () => {
      await waitForBundledExtensionsToBeLoaded();
      await delay(50); // wait just a bit longer to let the first round of rendering happen
    };
  },
});

export default waitUntilBundledExtensionsAreLoadedInjectable;
