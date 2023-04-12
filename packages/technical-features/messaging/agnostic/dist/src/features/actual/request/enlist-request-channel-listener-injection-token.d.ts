import type { Disposer } from "@k8slens/utilities/index";
import type { RequestChannel, RequestChannelListener } from "./request-channel-listener-injection-token";
export type EnlistRequestChannelListener = <Request, Response>(listener: RequestChannelListener<RequestChannel<Request, Response>>) => Disposer;
export declare const enlistRequestChannelListenerInjectionToken: import("@ogre-tools/injectable").InjectionToken<EnlistRequestChannelListener, void>;
