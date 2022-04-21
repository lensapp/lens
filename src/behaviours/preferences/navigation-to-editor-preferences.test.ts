/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import type { UserStore } from "../../common/user-store";
import themeStoreInjectable from "../../renderer/themes/store.injectable";
import type { ThemeStore } from "../../renderer/themes/store";

describe("preferences - navigation to editor preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi }) => {
      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
        editorConfiguration: { minimap: {}, tabSize: 42, fontSize: 42 },
      } as unknown as UserStore;

      rendererDi.override(userStoreInjectable, () => userStoreStub);

      const themeStoreStub = ({ themeOptions: [] }) as unknown as ThemeStore;

      rendererDi.override(themeStoreInjectable, () => themeStoreStub);
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

    it("does not show editor preferences yet", () => {
      const page = rendered.queryByTestId("editor-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to editor preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("editor");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows editor preferences", () => {
        const page = rendered.getByTestId("editor-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
