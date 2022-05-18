/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import defaultShellInjectable from "../../renderer/components/+preferences/default-shell.injectable";

describe("preferences - navigation to terminal preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(defaultShellInjectable, () => "some-default-shell");
    });
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeRender(() => {
        applicationBuilder.preferences.navigate();
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show terminal preferences yet", () => {
      const page = rendered.queryByTestId("terminal-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to terminal preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("terminal");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows terminal preferences", () => {
        const page = rendered.getByTestId("terminal-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
