export { messagingFeature } from "./feature";

export { getRequestChannel } from "./request/get-request-channel";
export { getMessageChannel } from "./message/get-message-channel";

export {
  computedChannelInjectionToken,
  computedChannelObserverInjectionToken,
} from "./computed-channel/computed-channel.injectable";

export type {
  ChannelObserver,
  ComputedChannelFactory,
  JsonifiableObject,
  JsonifiableArray,
  Jsonifiable,
} from "./computed-channel/computed-channel.injectable";

export { requestFromChannelInjectionToken } from "./request/request-from-channel-injection-token.no-coverage";

export type { Channel } from "./channel.no-coverage";

export { sendMessageToChannelInjectionToken } from "./message/message-to-channel-injection-token.no-coverage";
export type { SendMessageToChannel } from "./message/message-to-channel-injection-token.no-coverage";

export type {
  GetMessageChannelListenerInfo,
  MessageChannel,
  MessageChannelListener,
} from "./message/message-channel-listener-injection-token";

export {
  messageChannelListenerInjectionToken,
  getMessageChannelListenerInjectable,
} from "./message/message-channel-listener-injection-token";

export type {
  RequestChannel,
  RequestChannelHandler,
} from "./request/request-channel-listener-injection-token";

export type {
  RequestFromChannel,
  ChannelRequester,
} from "./request/request-from-channel-injection-token.no-coverage";

export type { EnlistMessageChannelListener } from "./message/enlist-message-channel-listener-injection-token";
export { enlistMessageChannelListenerInjectionToken } from "./message/enlist-message-channel-listener-injection-token";

export type { EnlistRequestChannelListener } from "./request/enlist-request-channel-listener-injection-token";
export { enlistRequestChannelListenerInjectionToken } from "./request/enlist-request-channel-listener-injection-token";

export type { ListeningOfChannels } from "./listening-of-channels/listening-of-channels.injectable";
export { listeningOfChannelsInjectionToken } from "./listening-of-channels/listening-of-channels.injectable";

export type {
  GetRequestChannelListenerInjectableInfo,
  RequestChannelListener,
} from "./request/request-channel-listener-injection-token";

export {
  getRequestChannelListenerInjectable,
  requestChannelListenerInjectionToken,
} from "./request/request-channel-listener-injection-token";
