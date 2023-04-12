import type { DiContainerForInjection } from "@ogre-tools/injectable";
export interface RequestChannel<Request, Response> {
    id: string;
    _requestSignature?: Request;
    _responseSignature?: Response;
}
export type RequestChannelHandler<Channel> = Channel extends RequestChannel<infer Request, infer Response> ? (req: Request) => Promise<Response> | Response : never;
export interface RequestChannelListener<Channel> {
    id: string;
    channel: Channel;
    handler: RequestChannelHandler<Channel>;
}
export declare const requestChannelListenerInjectionToken: import("@ogre-tools/injectable").InjectionToken<RequestChannelListener<RequestChannel<unknown, unknown>>, void>;
export interface GetRequestChannelListenerInjectableInfo<Channel extends RequestChannel<Request, Response>, Request, Response> {
    id: string;
    channel: Channel;
    getHandler: (di: DiContainerForInjection) => RequestChannelHandler<Channel>;
}
export declare const getRequestChannelListenerInjectable: <Channel extends RequestChannel<Request_1, Response_1>, Request_1, Response_1>(info: GetRequestChannelListenerInjectableInfo<Channel, Request_1, Response_1>) => import("@ogre-tools/injectable").Injectable<{
    id: string;
    channel: Channel;
    handler: RequestChannelHandler<Channel>;
}, RequestChannelListener<RequestChannel<unknown, unknown>>, void>;
