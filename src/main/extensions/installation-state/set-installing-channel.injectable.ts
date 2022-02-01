/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import registerEmitterChannelInjectable from "../../../common/communication/register-emitter.injectable";
import installationStateLoggerInjectable from "../../../extensions/installation-state/logger.injectable";
import { setInstallingChannel, setInstallingChannelInjectionToken } from "../../../extensions/installation-state/state-channels";

const setInstallingChannelInjectable = getInjectable({
  instantiate: (di) => {
    const registerEmitterChannel = di.inject(registerEmitterChannelInjectable);
    const logger = di.inject(installationStateLoggerInjectable);

    return registerEmitterChannel(setInstallingChannel, logger);
  },
  injectionToken: setInstallingChannelInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default setInstallingChannelInjectable;
