import type React from "react";
export type ReactApplicationHigherOrderComponent = React.ComponentType<{
    children: React.ReactNode;
}>;
export declare const reactApplicationHigherOrderComponentInjectionToken: import("@ogre-tools/injectable").InjectionToken<ReactApplicationHigherOrderComponent, void>;
