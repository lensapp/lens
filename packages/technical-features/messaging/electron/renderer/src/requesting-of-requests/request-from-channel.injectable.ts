import { getInjectable } from "@ogre-tools/injectable";
import type { RequestFromChannel } from "@k8slens/messaging";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import invokeIpcInjectable from "./invoke-ipc.injectable";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: (di) => {
    const invokeIpc = di.inject(invokeIpcInjectable);

    return ((channel, request) => invokeIpc(channel.id, request)) as RequestFromChannel;
  },

  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
