/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { getInjectablesForInitializable } from "../../../../common/initializable-state/create";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import { enabledExtensionsPersistentStorageVersionChannel, enabledExtensionsPersistentStorageVersionInitializable } from "../common/storage-version";

const {
  initializationInjectable: enabledExtensionsPersistentStorageVersionInitializationInjectable,
  stateInjectable: enabledExtensionsPersistentStorageVersionStateInjectable,
} = getInjectablesForInitializable({
  token: enabledExtensionsPersistentStorageVersionInitializable,
  init: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return requestFromChannel(enabledExtensionsPersistentStorageVersionChannel);
  },
  phase: beforeFrameStartsSecondInjectionToken,
});

export {
  enabledExtensionsPersistentStorageVersionInitializationInjectable,
  enabledExtensionsPersistentStorageVersionStateInjectable,
};
