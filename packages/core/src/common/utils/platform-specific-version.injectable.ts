/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import platformInjectable from "../vars/platform.injectable";

export interface PlatformSpecific<T> {
  instantiate: () => T;
  readonly platform: NodeJS.Platform;
}

const platformSpecificVersionInjectable = getInjectable({
  id: "platform-specific-version",
  instantiate: (di: DiContainerForInjection) => {
    const targetPlatform = di.inject(platformInjectable);

    return <T>(token: InjectionToken<PlatformSpecific<T>, void>) => (
      di.injectMany(token)
        .find(impl => impl.platform === targetPlatform)
        ?.instantiate()
    );
  },
});

export default platformSpecificVersionInjectable;

