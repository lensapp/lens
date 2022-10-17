/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getSingleElement, querySingleElement } from "../../renderer/components/test-utils/discovery-of-html-elements";

describe("show-about-using-tray", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  it("does not show application preferences yet", () => {
    const page = querySingleElement(
      "preference-page",
      "application",
    )(rendered);

    expect(page).toBeNull();
  });

  describe("when navigating using tray", () => {
    beforeEach(async () => {
      await applicationBuilder.tray.click("open-preferences");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
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
