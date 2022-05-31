/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { act } from "@testing-library/react";
import React from "react";
import { UpdateButton } from "../update-button";
import "@testing-library/jest-dom/extend-expect";
import type { DiContainer } from "@ogre-tools/injectable";
import appUpdateWarningLevelInjectable from "../../../app-update-warning/app-update-warning-level.injectable";
import { computed } from "mobx";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import updateAppInjectable from "../update-app.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";

describe("<UpdateButton/>", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(updateAppInjectable, jest.fn);
    di.override(appUpdateWarningLevelInjectable, () => computed(() => ""));

    render = renderFor(di);
  });

  it("should not render if no warning level prop passed", () => {
    const { queryByTestId } = render(<UpdateButton />);

    expect(queryByTestId("update-button")).not.toBeInTheDocument();
  });

  it("should render if warning level prop passed", () => {
    di.override(appUpdateWarningLevelInjectable, () => computed(() => "light"));

    const { getByTestId } = render(<UpdateButton />);

    expect(getByTestId("update-button")).toMatchSnapshot();
  });

  it("should open menu when clicked", async () => {
    di.override(appUpdateWarningLevelInjectable, () => computed(() => "light"));

    const { getByTestId } = render(<UpdateButton />);

    const button = getByTestId("update-button");

    act(() => button.click());

    expect(getByTestId("update-lens-menu-item")).toBeInTheDocument();
  });

  it("should call update function when menu item clicked", () => {
    const update = jest.fn();

    di.override(appUpdateWarningLevelInjectable, () => computed(() => "light"));
    di.override(updateAppInjectable, update);

    const { getByTestId } = render(<UpdateButton />);

    const button = getByTestId("update-button");

    act(() => button.click());

    const menuItem = getByTestId("update-lens-menu-item");

    menuItem.click();

    expect(update).toHaveBeenCalled();
  });

  it("should have light warning level", () => {
    di.override(appUpdateWarningLevelInjectable, () => computed(() => "light"));

    const { getByTestId } = render(<UpdateButton />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("light");
  });

  it("should have medium warning level", () => {
    di.override(appUpdateWarningLevelInjectable, () => computed(() => "medium"));

    const { getByTestId } = render(<UpdateButton />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("medium");
  });

  it("should have high warning level", () => {
    di.override(appUpdateWarningLevelInjectable, () => computed(() => "high"));

    const { getByTestId } = render(<UpdateButton />);

    const button = getByTestId("update-button");

    expect(button.dataset.warningLevel).toBe("high");
  });
});
