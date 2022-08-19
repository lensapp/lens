/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show application preferences page yet", () => {
    const actual = rendered.queryByTestId("application-preferences-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to preferences using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("root.preferences");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows application preferences page", () => {
      const actual = rendered.getByTestId("application-preferences-page");

      expect(actual).not.toBeNull();
    });
  });
});
