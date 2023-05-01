/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("preferences - navigation to editor preferences", () => {
  let builder: ApplicationBuilder;
  let discover: Discover;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      await builder.beforeWindowStart(() => {
        builder.preferences.navigate();
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });
    it("does not show editor preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "editor-page",
      );

      expect(discovered).toBeNull();
    });

    describe("when navigating to editor preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("editor");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows editor preferences", () => {
        const page = discover.getSingleElement(
          "preference-page",
          "editor-page",
        );

        expect(page).not.toBeNull();
      });
    });
  });
});
