/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { act } from "@testing-library/react";
import React from "react";
import { UpdateButton } from "../update-button";
import "@testing-library/jest-dom/extend-expect";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";

const update = jest.fn();

describe("<UpdateButton/>", () => {
  let render: DiRender;

  beforeEach(() => {

    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);

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

  it("should open menu when clicked", async () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    const button = getByTestId("update-button");

    act(() => button.click());

    expect(getByTestId("update-lens-menu-item")).toBeInTheDocument();
  });

  it("should call update function when menu item clicked", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    const button = getByTestId("update-button");

    act(() => button.click());

    const menuItem = getByTestId("update-lens-menu-item");

    menuItem.click();

    expect(update).toHaveBeenCalled();
  });

  it("should have light warning level", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="light" />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("light");
  });

  it("should have medium warning level", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="medium" />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("medium");
  });

  it("should have high warning level", () => {
    const { getByTestId } = render(<UpdateButton update={update} warningLevel="high" />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("high");
  });
});
