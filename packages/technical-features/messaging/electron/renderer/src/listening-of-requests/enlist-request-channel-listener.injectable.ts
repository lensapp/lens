/* c8 ignore start */
import { getInjectable } from "@ogre-tools/injectable";
import { enlistRequestChannelListenerInjectionToken } from "@k8slens/messaging";

const enlistRequestChannelListenerInjectable = getInjectable({
  id: "enlist-request-channel-listener-for-renderer",

  instantiate: () => (listener) => {
    throw new Error(
      `Tried to enlist request channel "${listener.channel.id}" in "renderer", but requesting it's not supported yet.`,
    );
  },

  injectionToken: enlistRequestChannelListenerInjectionToken,
});

export default enlistRequestChannelListenerInjectable;
/* c8 ignore end */
