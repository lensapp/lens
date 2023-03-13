import { sendMessageToChannelInjectionToken } from "../actual/message/message-to-channel-injection-token.no-coverage";
import { enlistMessageChannelListenerInjectionToken } from "../actual/message/enlist-message-channel-listener-injection-token";
import { requestFromChannelInjectionToken } from "../actual/request/request-from-channel-injection-token.no-coverage";
import { enlistRequestChannelListenerInjectionToken } from "../actual/request/enlist-request-channel-listener-injection-token";
import { getInjectable } from "@ogre-tools/injectable";

export const sendMessageToChannelStubInjectable = getInjectable({
  id: "send-message-to-channel-stub",
  instantiate: () => () => {},
  injectionToken: sendMessageToChannelInjectionToken,
});

export const enlistMessageChannelListenerStubInjectable = getInjectable({
  id: "enlist-message-channel-listener-stub",
  instantiate: () => () => () => {},
  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export const requestFromChannelStubInjectable = getInjectable({
  id: "request-from-channel-stub",
  instantiate: () => () => Promise.resolve(),
  injectionToken: requestFromChannelInjectionToken,
});

export const enlistRequestChannelListenerStubInjectable = getInjectable({
  id: "enlist-request-channel-listener-stub",
  instantiate: () => () => () => {},
  injectionToken: enlistRequestChannelListenerInjectionToken,
});
