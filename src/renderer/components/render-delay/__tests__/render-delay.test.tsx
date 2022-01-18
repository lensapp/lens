/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { RenderDelay } from "../render-delay";
import { mockWindow } from "../../../../../__mocks__/windowMock";

mockWindow();

describe("<RenderDelay/>", () => {
  it("renders w/o errors", () => {
    const { container } = render(<RenderDelay><button>My button</button></RenderDelay>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders it's child", () => {
    const { getByText } = render(<RenderDelay><button>My button</button></RenderDelay>);

    expect(getByText("My button")).toBeInTheDocument();
  });
});
