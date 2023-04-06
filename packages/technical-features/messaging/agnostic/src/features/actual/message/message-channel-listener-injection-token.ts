import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

export interface MessageChannel<Message> {
  id: string;
  _messageSignature?: Message;
}

export type ExtraData = { processId: number; frameId: number };

export type MessageChannelHandler<Channel> = Channel extends MessageChannel<infer Message>
  ? (message: Message, data?: ExtraData) => void
  : never;

export interface MessageChannelListener<Channel> {
  id: string;
  channel: Channel;
  handler: MessageChannelHandler<Channel>;
}

export const messageChannelListenerInjectionToken = getInjectionToken<MessageChannelListener<MessageChannel<unknown>>>({
  id: "message-channel-listener",
});

export interface GetMessageChannelListenerInfo<Channel extends MessageChannel<Message>, Message> {
  id: string;
  channel: Channel;
  getHandler: (di: DiContainerForInjection) => MessageChannelHandler<Channel>;
  causesSideEffects?: boolean;
}

export const getMessageChannelListenerInjectable = <Channel extends MessageChannel<Message>, Message>(
  info: GetMessageChannelListenerInfo<Channel, Message>,
) =>
  getInjectable({
    id: `${info.channel.id}-message-listener-${info.id}`,

    instantiate: (di): MessageChannelListener<Channel> => ({
      id: `${info.channel.id}-message-listener-${info.id}`,
      channel: info.channel,
      handler: info.getHandler(di),
    }),

    injectionToken: messageChannelListenerInjectionToken,
    causesSideEffects: info.causesSideEffects,
  });
