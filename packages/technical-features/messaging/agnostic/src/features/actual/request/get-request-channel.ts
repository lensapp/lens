import type { RequestChannel } from "./request-channel-listener-injection-token";

export const getRequestChannel = <Request, Response>(id: string): RequestChannel<Request, Response> => ({
  id,
});
