/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createDependentInitializableState } from "../../../../common/initializable-state/create-dependent";
import releaseChannelInjectable, { initReleaseChannelOnMainInjectable, initReleaseChannelOnRendererInjectable } from "../../../../common/vars/release-channel.injectable";
import { updateChannels } from "../update-channels";

const {
  value: defaultUpdateChannelInjectable,
  initializers: [
    initDefaultUpdateChannelOnMainInjectable,
    initDefaultUpdateChannelOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "default-update-channel",
  init: (di) => updateChannels[di.inject(releaseChannelInjectable).get()],
  initAfter: [
    initReleaseChannelOnMainInjectable,
    initReleaseChannelOnRendererInjectable,
  ],
});

export {
  initDefaultUpdateChannelOnMainInjectable,
  initDefaultUpdateChannelOnRendererInjectable,
};

export default defaultUpdateChannelInjectable;
