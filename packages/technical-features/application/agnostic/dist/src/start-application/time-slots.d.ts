import type { Runnable } from "@k8slens/run-many";
export declare const beforeApplicationIsLoadingInjectionToken: import("@ogre-tools/injectable").InjectionToken<Runnable<void>, void>;
export declare const onLoadOfApplicationInjectionToken: import("@ogre-tools/injectable").InjectionToken<Runnable<void>, void>;
export declare const afterApplicationIsLoadedInjectionToken: import("@ogre-tools/injectable").InjectionToken<Runnable<void>, void>;
