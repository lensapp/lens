import type { DiContainerForInjection } from "@ogre-tools/injectable";
export interface MessageChannel<Message> {
    id: string;
    _messageSignature?: Message;
}
export type ExtraData = {
    processId: number;
    frameId: number;
};
export type MessageChannelHandler<Channel> = Channel extends MessageChannel<infer Message> ? (message: Message, data?: ExtraData) => void : never;
export interface MessageChannelListener<Channel> {
    id: string;
    channel: Channel;
    handler: MessageChannelHandler<Channel>;
}
export declare const messageChannelListenerInjectionToken: import("@ogre-tools/injectable").InjectionToken<MessageChannelListener<MessageChannel<unknown>>, void>;
export interface GetMessageChannelListenerInfo<Channel extends MessageChannel<Message>, Message> {
    id: string;
    channel: Channel;
    getHandler: (di: DiContainerForInjection) => MessageChannelHandler<Channel>;
    causesSideEffects?: boolean;
}
export declare const getMessageChannelListenerInjectable: <Channel extends MessageChannel<Message>, Message>(info: GetMessageChannelListenerInfo<Channel, Message>) => import("@ogre-tools/injectable").Injectable<MessageChannelListener<Channel>, MessageChannelListener<MessageChannel<unknown>>, void>;
