import React from "react";
import type { RenderResult } from "@testing-library/react";
import type { DiContainer } from "@ogre-tools/injectable";
export type DiRender = (ui: React.ReactElement) => RenderResult;
type DiRenderFor = (di: DiContainer) => DiRender;
export declare const renderFor: DiRenderFor;
export {};
