/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { VerticalBar } from ".";

describe("<VerticalBar/>", () => {
  it("renders <VerticalBar /> w/o errors", async () => {

    const { container } = render(<VerticalBar color="red" value={50} />);

    expect(container.querySelector("[data-testid='vertical-bar']")).toBeInTheDocument();
  });

  it("bar uses provided color and value", () => {
    const { container } = render(<VerticalBar color="red" value={50} />);

    expect(container.querySelector("[data-testid='vertical-bar'] div")).toHaveStyle(`
      background-color: red;
      height: 50%;
    `);
  });
});
