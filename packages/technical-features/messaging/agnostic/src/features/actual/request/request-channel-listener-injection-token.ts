import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

export interface RequestChannel<Request, Response> {
  id: string;
  _requestSignature?: Request;
  _responseSignature?: Response;
}

export type RequestChannelHandler<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (req: Request) => Promise<Response> | Response
  : never;

export interface RequestChannelListener<Channel> {
  id: string;
  channel: Channel;
  handler: RequestChannelHandler<Channel>;
}

export const requestChannelListenerInjectionToken = getInjectionToken<
  RequestChannelListener<RequestChannel<unknown, unknown>>
>({
  id: "request-channel-listener",
});

export interface GetRequestChannelListenerInjectableInfo<
  Channel extends RequestChannel<Request, Response>,
  Request,
  Response,
> {
  id: string;
  channel: Channel;
  getHandler: (di: DiContainerForInjection) => RequestChannelHandler<Channel>;
}

export const getRequestChannelListenerInjectable = <
  Channel extends RequestChannel<Request, Response>,
  Request,
  Response,
>(
  info: GetRequestChannelListenerInjectableInfo<Channel, Request, Response>,
) =>
  getInjectable({
    id: `${info.channel.id}-request-listener-${info.id}`,

    instantiate: (di) =>
      ({
        id: `${info.channel.id}-request-listener-${info.id}`,
        channel: info.channel,
        handler: info.getHandler(di),
      } as RequestChannelListener<Channel>),

    injectionToken: requestChannelListenerInjectionToken,
  });
