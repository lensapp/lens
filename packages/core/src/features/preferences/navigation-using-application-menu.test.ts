/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("preferences - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;
  let discover: Discover;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    rendered = await applicationBuilder.render();
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

  describe("when navigating to preferences using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click(
        "root",
        "mac",
        "navigate-to-preferences",
      );
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
});
