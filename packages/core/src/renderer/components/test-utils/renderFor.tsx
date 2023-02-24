/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { DiContainer } from "@ogre-tools/injectable";
import { DiContextProvider } from "@ogre-tools/injectable-react";

export type DiRender = (ui: React.ReactElement) => RenderResult;

type DiRenderFor = (di: DiContainer) => DiRender;

const getDOM = (di: DiContainer, ui: React.ReactElement) => (
  <DiContextProvider value={{ di }}>
    {ui}
  </DiContextProvider>
);

export const renderFor: DiRenderFor = (di) => (ui) => {
  const result = render(getDOM(di, ui));

  return {
    ...result,
    rerender: (ui) => result.rerender(getDOM(di, ui)),
  };
};
