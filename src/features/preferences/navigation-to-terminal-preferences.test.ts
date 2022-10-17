/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getSingleElement, querySingleElement } from "../../renderer/components/test-utils/discovery-of-html-elements";

describe("preferences - navigation to terminal preferences", () => {
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

    it("does not show terminal preferences yet", () => {
      const page = querySingleElement(
        "preference-page",
        "terminal",
      )(rendered);

      expect(page).toBeNull();
    });

    describe("when navigating to terminal preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("terminal");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });


      it("shows terminal preferences", () => {
        const page = getSingleElement(
          "preference-page",
          "terminal",
        )(rendered);

        expect(page).not.toBeNull();
      });
    });
  });
});
