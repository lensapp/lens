/* c8 ignore start */
import { getInjectable } from "@ogre-tools/injectable";
import { RequestChannel, RequestFromChannel, requestFromChannelInjectionToken } from "@k8slens/messaging";

const requestFromChannelInjectable = getInjectable({
  id: "request-from-channel",

  instantiate: () =>
    ((channel: RequestChannel<any, any>) => {
      throw new Error(`Tried to request from channel "${channel.id}" but requesting in "main" it's not supported yet`);
    }) as unknown as RequestFromChannel,

  injectionToken: requestFromChannelInjectionToken,
});

export default requestFromChannelInjectable;
/* c8 ignore stop */
