/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("preferences - navigation to proxy preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      applicationBuilder.beforeWindowStart(() => {
        applicationBuilder.preferences.navigate();
      });

      rendered = await applicationBuilder.render();
      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show proxy preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "proxy-page",
      );

      expect(discovered).toBeNull();
    });

    describe("when navigating to proxy preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("proxy");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows proxy preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "proxy-page",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });
});
