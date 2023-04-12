import { IComputedValue } from "mobx";
import type { MessageChannel } from "@k8slens/messaging";
export type ComputedChannelFactory = <T>(channel: MessageChannel<T>, pendingValue: T) => IComputedValue<T>;
export declare const computedChannelInjectionToken: import("@ogre-tools/injectable").InjectionToken<ComputedChannelFactory, void>;
export type ChannelObserver<T> = {
    channel: MessageChannel<T>;
    observer: IComputedValue<T>;
};
export declare const computedChannelObserverInjectionToken: import("@ogre-tools/injectable").InjectionToken<ChannelObserver<unknown>, void>;
declare const computedChannelInjectable: import("@ogre-tools/injectable").Injectable<ComputedChannelFactory, ComputedChannelFactory, void>;
export default computedChannelInjectable;
