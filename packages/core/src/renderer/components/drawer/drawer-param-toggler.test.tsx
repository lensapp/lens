/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import React from "react";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../test-utils/renderFor";
import { DrawerParamToggler } from "./drawer-param-toggler";

describe("<DrawerParamToggler />", () => {
  let result: RenderResult;
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
    result = render((
      <DrawerParamToggler
        label="Foo"
      >
        <div data-testid="drawer-child"></div>
      </DrawerParamToggler>
    ));
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("does not render children by default", () => {
    expect(result.queryByTestId("drawer-child")).toBeNull();
  });

  describe("after clicking the toggle", () => {
    beforeEach(() => {
      result.getByTestId("drawer-param-toggler").click();
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("renders children", () => {
      expect(result.queryByTestId("drawer-child")).not.toBeNull();
    });

    describe("after clicking the toggle again", () => {
      beforeEach(() => {
        result.getByTestId("drawer-param-toggler").click();
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("does not children", () => {
        expect(result.queryByTestId("drawer-child")).toBeNull();
      });
    });
  });
});
