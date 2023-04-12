import type { MessageChannel } from "./message-channel-listener-injection-token";
export interface SendMessageToChannel {
    (channel: MessageChannel<void>): void;
    <Message>(channel: MessageChannel<Message>, message: Message): void;
}
export declare const sendMessageToChannelInjectionToken: import("@ogre-tools/injectable").InjectionToken<SendMessageToChannel, void>;
