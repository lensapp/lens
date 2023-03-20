/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import assert from "assert";
import React from "react";
import { Tooltip } from "./tooltip";

describe("<Tooltip />", () => {
  let requestAnimationFrameSpy: jest.SpyInstance<number, [callback: FrameRequestCallback]>;

  beforeEach(() => {
    requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame");

    requestAnimationFrameSpy.mockImplementation(cb => {
      cb(0);

      return 0;
    });
  });

  afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
  });


  it("does not render to DOM if not visibile", () => {
    const result = render((
      <>
        <Tooltip targetId="my-target" usePortal={false}>I am a tooltip</Tooltip>
        <div id="my-target">Target Text</div>
      </>
    ));

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders to DOM when hovering over target", () => {
    const result = render((
      <>
        <Tooltip
          targetId="my-target"
          data-testid="tooltip"
          usePortal={false}
        >
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </>
    ));

    const target = result.baseElement.querySelector("#my-target");

    assert(target);

    userEvent.hover(target);
    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders to DOM when forced to by visibile prop", () => {
    const result = render((
      <>
        <Tooltip
          targetId="my-target"
          data-testid="tooltip"
          visible={true}
          usePortal={false}
        >
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </>
    ));

    expect(result.baseElement).toMatchSnapshot();
  });
});
