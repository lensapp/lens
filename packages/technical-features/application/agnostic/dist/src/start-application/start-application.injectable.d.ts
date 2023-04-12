export type StartApplication = () => Promise<void>;
export declare const startApplicationInjectionToken: import("@ogre-tools/injectable").InjectionToken<StartApplication, void>;
declare const startApplicationInjectable: import("@ogre-tools/injectable").Injectable<StartApplication, StartApplication, void>;
export default startApplicationInjectable;
