import type React from "react";
import type { IComputedValue } from "mobx";
export interface ReactApplicationChildren {
    id: string;
    Component: React.ComponentType;
    enabled: IComputedValue<boolean>;
}
export declare const reactApplicationChildrenInjectionToken: import("@ogre-tools/injectable").InjectionToken<ReactApplicationChildren, void>;
