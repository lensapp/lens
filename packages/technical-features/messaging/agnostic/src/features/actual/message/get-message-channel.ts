import type { MessageChannel } from "./message-channel-listener-injection-token";

export const getMessageChannel = <Request>(id: string): MessageChannel<Request> => ({
  id,
});
