import { getInjectable } from "@ogre-tools/injectable";
import { RequestChannel, RequestFromChannel, requestFromChannelInjectionToken } from "@k8slens/messaging";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: () =>
    (async <Request, Response>(channel: RequestChannel<Request, Response>) => {
      throw new Error(`Tried to request from channel "${channel.id}" from main, which is not supported.`);
    }) as RequestFromChannel,
  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
