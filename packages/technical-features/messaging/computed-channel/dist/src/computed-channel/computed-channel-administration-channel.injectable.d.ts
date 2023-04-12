export type ComputedChannelAdminMessage = {
    channelId: string;
    status: "became-observed" | "became-unobserved";
};
export declare const computedChannelAdministrationChannel: import("@k8slens/messaging").MessageChannel<ComputedChannelAdminMessage>;
export declare const computedChannelAdministrationListenerInjectable: import("@ogre-tools/injectable").Injectable<import("@k8slens/messaging").MessageChannelListener<import("@k8slens/messaging").MessageChannel<ComputedChannelAdminMessage>>, import("@k8slens/messaging").MessageChannelListener<import("@k8slens/messaging").MessageChannel<unknown>>, void>;
