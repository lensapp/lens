/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences - navigation to proxy preferences", () => {
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

    it("does not show proxy preferences yet", () => {
      const page = rendered.queryByTestId("proxy-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to proxy preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("proxy");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows proxy preferences", () => {
        const page = rendered.getByTestId("proxy-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
