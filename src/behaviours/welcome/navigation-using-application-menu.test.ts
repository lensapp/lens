/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import isAutoUpdateEnabledInjectable from "../../main/is-auto-update-enabled.injectable";

describe("welcome - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder().beforeSetups(({ mainDi }) => {
      mainDi.override(isAutoUpdateEnabledInjectable, () => () => false);
    });

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show welcome page yet", () => {
    const actual = rendered.queryByTestId("welcome-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to welcome using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("help.welcome");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows welcome page", () => {
      const actual = rendered.getByTestId("welcome-page");

      expect(actual).not.toBeNull();
    });
  });
});
