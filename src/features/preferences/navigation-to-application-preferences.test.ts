/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToProxyPreferencesInjectable from "./common/navigate-to-proxy-preferences.injectable";
import type { Discover } from "../../renderer/components/test-utils/discovery-of-html-elements";
import { discoverFor } from "../../renderer/components/test-utils/discovery-of-html-elements";

describe("preferences - navigation to application preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in some child page of preferences, when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        const navigateToProxyPreferences = windowDi.inject(navigateToProxyPreferencesInjectable);

        navigateToProxyPreferences();
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show application preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "application-page",
      );

      expect(discovered).toBeNull();
    });

    describe("when navigating to application preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("app");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows application preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "application-page",
        );

        expect(discovered).not.toBeNull();
      });
    });

    describe("when navigating to preferences without specifying the tab", () => {
      beforeEach(() => {
        builder.preferences.navigate();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows tab for application preferences for it being the default", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "application-page",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });
});

