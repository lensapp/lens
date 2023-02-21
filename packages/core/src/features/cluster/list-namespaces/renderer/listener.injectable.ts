/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "../../../../common/utils";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import currentlyInClusterFrameInjectable from "../../../../renderer/routes/currently-in-cluster-frame.injectable";
import { clusterFailedToListNamespacesChannel } from "../common/channel";
import listNamespacesForbiddenHandlerInjectable from "./list-namespaces-forbidden-handler.injectable";

const clusterFailedToListNamespacesListenerInjectable = getMessageChannelListenerInjectable({
  channel: clusterFailedToListNamespacesChannel,
  id: "main",
  handler: (di) => {
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    if (currentlyInClusterFrame) {
      return noop;
    }

    return di.inject(listNamespacesForbiddenHandlerInjectable);
  },
});

export default clusterFailedToListNamespacesListenerInjectable;
