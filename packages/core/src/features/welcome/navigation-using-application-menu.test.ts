/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("welcome - navigation using application menu", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    rendered = await builder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("shows welcome page being front page", () => {
    const actual = rendered.getByTestId("welcome-page");

    expect(actual).not.toBeNull();
  });

  describe("when navigated somewhere else", () => {
    beforeEach(() => {
      builder.applicationMenu.click(
        "root",
        "mac",
        "navigate-to-preferences",
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show welcome page", () => {
      const actual = rendered.queryByTestId("welcome-page");

      expect(actual).toBeNull();
    });

    describe("when navigated to welcome using application menu", () => {
      beforeEach(() => {
        builder.applicationMenu.click(
          "root",
          "help",
          "navigate-to-welcome",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows welcome page", () => {
        const actual = rendered.getByTestId("welcome-page");

        expect(actual).not.toBeNull();
      });
    });
  });
});
