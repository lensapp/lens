import { StartableStoppable } from "@k8slens/startable-stoppable";
export type ListeningOfChannels = StartableStoppable;
export declare const listeningOfChannelsInjectionToken: import("@ogre-tools/injectable").InjectionToken<StartableStoppable, void>;
declare const listeningOfChannelsInjectable: import("@ogre-tools/injectable").Injectable<StartableStoppable, StartableStoppable, void>;
export default listeningOfChannelsInjectable;
