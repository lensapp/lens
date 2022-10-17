/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getSingleElement, querySingleElement } from "../../renderer/components/test-utils/discovery-of-html-elements";

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

  it("does not show application preferences yet", () => {
    const page = querySingleElement(
      "preference-page",
      "application",
    )(rendered);

    expect(page).toBeNull();
  });

  describe("when navigating to preferences using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("root.mac.navigate-to-preferences");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows application preferences", () => {
      const page = getSingleElement(
        "preference-page",
        "application",
      )(rendered);

      expect(page).not.toBeNull();
    });
  });
});
