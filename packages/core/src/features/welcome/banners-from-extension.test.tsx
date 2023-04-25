/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { RenderResult } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { defaultWidth } from "../../renderer/components/welcome/welcome";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("Banners from extensions", () => {
  let builder: ApplicationBuilder;
  let renderResult: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    renderResult = await builder.render();
  });

  it("initially renderes welcome page", () => {
    expect(renderResult.queryByTestId("welcome-page")).toBeInTheDocument();
  });

  it("shows the empty welcome banner icon", () => {
    expect(renderResult.queryByTestId("no-welcome-banners-icon")).toBeInTheDocument();
  });

  describe("when an extension is enabled with a single welcome banner", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",
        rendererOptions: {
          welcomeBanners: [
            {
              Banner: () => <div data-testid="some-test-id" />,
            },
          ],
        },
      });
    });

    it("renders the banner from the extension", () => {
      expect(renderResult.queryByTestId("some-test-id")).toBeInTheDocument();
    });

    it("no longer shows the empty welcome banner icon", () => {
      expect(renderResult.queryByTestId("no-welcome-banners-icon")).not.toBeInTheDocument();
    });
  });

  describe("when an extension is enabled with multiple banners with custom widths", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",
        rendererOptions: {
          welcomeBanners: [
            {
              width: 100,
              Banner: () => <div />,
            },
            {
              width: 800,
              Banner: () => <div />,
            },
          ],
        },
      });
    });

    it("no longer shows the empty welcome banner icon", () => {
      expect(renderResult.queryByTestId("no-welcome-banners-icon")).not.toBeInTheDocument();
    });

    it("computes an opropriate width for the carosel", () => {
      expect(screen.queryByTestId("welcome-banner-container")).toHaveStyle({
        // should take the max width of the banners (if > defaultWidth)
        width: `800px`,
      });
      expect(screen.queryByTestId("welcome-text-container")).toHaveStyle({
        width: `${defaultWidth}px`,
      });
      expect(screen.queryByTestId("welcome-menu-container")).toHaveStyle({
        width: `${defaultWidth}px`,
      });
    });
  });
});
