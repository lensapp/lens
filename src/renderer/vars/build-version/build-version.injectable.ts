/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../../../common/initializable-state/create";
import { buildVersionChannel, buildVersionInjectionToken } from "../../../common/vars/build-semantic-version.injectable";
import requestFromChannelInjectable from "../../utils/channel/request-from-channel.injectable";

const buildVersionInjectable = createInitializableState({
  id: "build-version",
  init: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return requestFromChannel(buildVersionChannel);
  },
  injectionToken: buildVersionInjectionToken,
});

export default buildVersionInjectable;
