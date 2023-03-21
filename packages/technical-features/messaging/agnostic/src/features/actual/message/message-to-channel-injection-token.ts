import { getInjectionToken } from "@ogre-tools/injectable";
import type { MessageChannel } from "./message-channel-listener-injection-token";

export interface SendMessageToChannel {
  (channel: MessageChannel<void>): void;
  <Message>(channel: MessageChannel<Message>, message: Message): void;
}

export const sendMessageToChannelInjectionToken = getInjectionToken<SendMessageToChannel>({
  id: "send-message-to-message-channel",
});
