/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../test-utils/application-builder";
import { setupInitializingApplicationBuilder } from "../test-utils/application-builder";

describe("add-cluster - navigation using application menu", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  setupInitializingApplicationBuilder(b => builder = b);

  beforeEach(async () => {
    rendered = await builder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show add cluster page yet", () => {
    const actual = rendered.queryByTestId("add-cluster-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to add cluster using application menu", () => {
    beforeEach(() => {
      builder.applicationMenu.click(
        "root",
        "file",
        "add-cluster",
      );
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows add cluster page", () => {
      const actual = rendered.getByTestId("add-cluster-page");

      expect(actual).not.toBeNull();
    });
  });
});
