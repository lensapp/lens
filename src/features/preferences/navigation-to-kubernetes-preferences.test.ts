/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import callForPublicHelmRepositoriesInjectable from "../helm-charts/child-features/preferences/renderer/adding-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";
import getActiveHelmRepositoriesInjectable from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import type { Discover } from "../../renderer/components/test-utils/discovery-of-html-elements";
import { discoverFor } from "../../renderer/components/test-utils/discovery-of-html-elements";

describe("preferences - navigation to kubernetes preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

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

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show kubernetes preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "kubernetes-page",
      );

      expect(discovered).toBeNull();
    });

    describe("when navigating to kubernetes preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("kubernetes");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows kubernetes preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "kubernetes-page",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });
});
