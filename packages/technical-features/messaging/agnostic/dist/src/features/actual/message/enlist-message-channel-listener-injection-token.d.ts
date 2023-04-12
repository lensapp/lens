import type { Disposer } from "@k8slens/utilities";
import type { MessageChannel, MessageChannelListener } from "./message-channel-listener-injection-token";
export type EnlistMessageChannelListener = <T>(listener: MessageChannelListener<MessageChannel<T>>) => Disposer;
export declare const enlistMessageChannelListenerInjectionToken: import("@ogre-tools/injectable").InjectionToken<EnlistMessageChannelListener, void>;
