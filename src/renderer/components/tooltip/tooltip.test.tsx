/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import userEvent from "@testing-library/user-event";
import assert from "assert";
import React from "react";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { Tooltip } from "./tooltip";

describe("<Tooltip />", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);
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
