/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import callForPublicHelmRepositoriesInjectable from "../../renderer/components/+preferences/kubernetes/helm-charts/adding-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";
import getActiveHelmRepositoriesInjectable from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";

describe("preferences - navigation to kubernetes preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeApplicationStart((mainDi) => {
        mainDi.override(
          getActiveHelmRepositoriesInjectable,
          () => async () => ({ callWasSuccessful: true, response: [] }),
        );
      });

      builder.beforeWindowStart((windowDi) => {
        windowDi.override(callForPublicHelmRepositoriesInjectable, () => async () => []);
      });

      builder.beforeWindowStart(() => {
        builder.preferences.navigate();
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show kubernetes preferences yet", () => {
      const page = rendered.queryByTestId("kubernetes-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to kubernetes preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("kubernetes");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows kubernetes preferences", () => {
        const page = rendered.getByTestId("kubernetes-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
