import type React from "react";
export type Render = (application: React.ReactElement) => void;
export declare const renderInjectionToken: import("@ogre-tools/injectable").InjectionToken<Render, void>;
declare const renderInjectable: import("@ogre-tools/injectable").Injectable<(application: React.ReactElement<any, string | React.JSXElementConstructor<any>>) => void | Element | React.Component<any, any, any>, Render, void>;
export default renderInjectable;
