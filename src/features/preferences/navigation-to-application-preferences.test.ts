/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToProxyPreferencesInjectable from "./common/navigate-to-proxy-preferences.injectable";
import { getSingleElement, querySingleElement } from "../../renderer/components/test-utils/discovery-of-html-elements";

describe("preferences - navigation to application preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in some child page of preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        const navigateToProxyPreferences = windowDi.inject(navigateToProxyPreferencesInjectable);

        navigateToProxyPreferences();
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show application preferences yet", () => {
      const page = querySingleElement(
        "preference-page",
        "application-page",
      )(rendered);

      expect(page).toBeNull();
    });

    describe("when navigating to application preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("app");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows application preferences", () => {
        const page = getSingleElement(
          "preference-page",
          "application-page",
        )(rendered);

        expect(page).not.toBeNull();
      });
    });
  });
});

