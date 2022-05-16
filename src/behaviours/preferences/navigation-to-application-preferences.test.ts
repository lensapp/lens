/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import type { UserStore } from "../../common/user-store";
import navigateToProxyPreferencesInjectable from "../../common/front-end-routing/routes/preferences/proxy/navigate-to-proxy-preferences.injectable";
import ipcRendererInjectable from "../../renderer/app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

describe("preferences - navigation to application preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi }) => {
      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
      } as unknown as UserStore;

      rendererDi.override(userStoreInjectable, () => userStoreStub);
      rendererDi.override(ipcRendererInjectable, () => ({
        on: jest.fn(),
        invoke: jest.fn(), // TODO: replace with proper mocking via the IPC bridge
      } as never));
    });
  });

  describe("given in some child page of preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeRender(({ rendererDi }) => {
        const navigateToProxyPreferences = rendererDi.inject(navigateToProxyPreferencesInjectable);

        navigateToProxyPreferences();
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show application preferences yet", () => {
      const page = rendered.queryByTestId("application-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to application preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("application");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows application preferences", () => {
        const page = rendered.getByTestId("application-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
