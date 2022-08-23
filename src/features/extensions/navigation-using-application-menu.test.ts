/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import focusWindowInjectable from "../../renderer/navigation/focus-window.injectable";

// TODO: Make components free of side effects by making them deterministic
jest.mock("../../renderer/components/input/input");

describe("extensions - navigation using application menu", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let focusWindowMock: jest.Mock;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeWindowStart((windowDi) => {
      focusWindowMock = jest.fn();

      windowDi.override(focusWindowInjectable, () => focusWindowMock);
    });

    rendered = await builder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show extensions page yet", () => {
    const actual = rendered.queryByTestId("extensions-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to extensions using application menu", () => {
    beforeEach(() => {
      builder.applicationMenu.click("root.extensions");
    });

    it("focuses the window", () => {
      expect(focusWindowMock).toHaveBeenCalled();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows extensions page", () => {
      const actual = rendered.getByTestId("extensions-page");

      expect(actual).not.toBeNull();
    });
  });
});
