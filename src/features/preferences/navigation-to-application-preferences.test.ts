/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToProxyPreferencesInjectable from "../../common/front-end-routing/routes/preferences/proxy/navigate-to-proxy-preferences.injectable";

describe("preferences - navigation to application preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
  });

  describe("given in some child page of preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeRender(({ rendererDi }) => {
        const navigateToProxyPreferences = rendererDi.inject(navigateToProxyPreferencesInjectable);

        navigateToProxyPreferences();
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show application preferences yet", () => {
      const page = rendered.queryByTestId("application-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to application preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("application");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows application preferences", () => {
        const page = rendered.getByTestId("application-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
