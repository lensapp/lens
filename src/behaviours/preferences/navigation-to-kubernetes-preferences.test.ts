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
import { observable } from "mobx";

describe("preferences - navigation to kubernetes preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi }) => {
      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
        syncKubeconfigEntries: observable.map(),
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

    it("does not show kubernetes preferences yet", () => {
      const page = rendered.queryByTestId("kubernetes-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to kubernetes preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("kubernetes");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows kubernetes preferences", () => {
        const page = rendered.getByTestId("kubernetes-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
