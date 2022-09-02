/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences - navigation to editor preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeWindowStart(() => {
        applicationBuilder.preferences.navigate();
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show editor preferences yet", () => {
      const page = rendered.queryByTestId("editor-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to editor preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("editor");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows editor preferences", () => {
        const page = rendered.getByTestId("editor-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
