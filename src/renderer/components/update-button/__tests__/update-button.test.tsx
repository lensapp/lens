/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { render } from "@testing-library/react";
import React from "react";
import { UpdateButton } from "../update-button";
import "@testing-library/jest-dom/extend-expect";

const update = jest.fn();

describe("<UpdateButton/>", () => {
  beforeEach(() => {
    update.mockClear();
  });

  it("should not render if no warning level prop passed", () => {
    const { queryByTestId } = render(<UpdateButton update={update} />);

    expect(queryByTestId("update-button")).not.toBeInTheDocument();
  });

  it("should render if warning level prop passed", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    expect(getByTestId("update-button")).toMatchSnapshot();
  });

  it("should open menu when clicked", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    const button = getByTestId("update-button");

    button.click();

    expect(getByTestId("update-lens-menu-item")).toBeInTheDocument();
  });

  it("should call update function when menu item clicked", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    const button = getByTestId("update-button");

    button.click();

    const menuItem = getByTestId("update-lens-menu-item");

    menuItem.click();

    expect(update).toHaveBeenCalled();
  });

  it("should have class name with medium warning level", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="medium" />);

    const button = getByTestId("update-button");

    expect(button.className.toLowerCase().includes("medium")).toBeTruthy();
  });

  it("should have class name with high warning level", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="high" />);

    const button = getByTestId("update-button");

    expect(button.className.toLowerCase().includes("high")).toBeTruthy();
  });
});
