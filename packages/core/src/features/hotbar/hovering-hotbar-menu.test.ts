/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("hovering hotbar menu tests", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    result = await builder.render();
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("should not yet render the hotbar name", () => {
    expect(result.queryByText("hotbar-menu-badge-tooltip-for-default")).not.toBeInTheDocument();
  });

  describe("when hovering over the hotbar menu", () => {
    beforeEach(() => {
      userEvent.hover(result.getByTestId("hotbar-menu-badge-for-default"));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("should render the hotbar name", () => {
      expect(result.getByTestId("hotbar-menu-badge-tooltip-for-default")).toBeInTheDocument();
    });
  });
});
