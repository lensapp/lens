/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Switch } from "../switch";

describe("<Switch/>", () => {
  it("renders w/o errors", () => {
    const { container } = render(<Switch />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("render label text", () => {
    const { getByLabelText } = render(<Switch>Test label</Switch>);

    expect(getByLabelText("Test label")).toBeTruthy();
  });

  it("passes disabled and checked attributes to input", () => {
    const { container } = render(<Switch checked disabled/>);
    const checkbox = container.querySelector("input[type=checkbox]");

    expect(checkbox).toHaveAttribute("disabled");
    expect(checkbox).toHaveAttribute("checked");
  });

  it("onClick event fired", () => {
    const onClick = jest.fn();
    const { getByTestId } = render(<Switch onClick={onClick}/>);
    const switcher = getByTestId("switch");

    fireEvent.click(switcher);

    expect(onClick).toHaveBeenCalled();
  });

  it("onClick event not fired for disabled item", () => {
    const onClick = jest.fn();
    const { getByTestId } = render(<Switch onClick={onClick} disabled/>);
    const switcher = getByTestId("switch");

    fireEvent.click(switcher);

    expect(onClick).not.toHaveBeenCalled();
  });
});
