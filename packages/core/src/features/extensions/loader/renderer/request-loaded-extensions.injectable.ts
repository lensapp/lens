/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import { loadedExtensionsChannel } from "../common/channels";

const requestLoadedExtensionsInjectable = getInjectable({
  id: "request-loaded-extensions",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return () => requestFromChannel(loadedExtensionsChannel);
  },
});

export default requestLoadedExtensionsInjectable;
