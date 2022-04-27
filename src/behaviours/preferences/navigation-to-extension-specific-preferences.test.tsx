/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import type { UserStore } from "../../common/user-store";
import React from "react";
import type { FakeExtensionData } from "../../renderer/components/test-utils/get-renderer-extension-fake";
import { getRendererExtensionFakeFor } from "../../renderer/components/test-utils/get-renderer-extension-fake";
import ipcRendererInjectable from "../../renderer/app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

describe("preferences - navigation to extension specific preferences", () => {
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

    it("does not show extension preferences yet", () => {
      const page = rendered.queryByTestId("extension-preferences-page");

      expect(page).toBeNull();
    });

    it("does not show link for extension preferences", () => {
      const actual = rendered.queryByTestId("tab-link-for-extensions");

      expect(actual).toBeNull();
    });

    describe("when extension with specific preferences is enabled", () => {
      beforeEach(() => {
        const getRendererExtensionFake = getRendererExtensionFakeFor(applicationBuilder);
        const testExtension = getRendererExtensionFake(extensionStubWithExtensionSpecificPreferenceItems);

        applicationBuilder.addExtensions(testExtension);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows link for extension preferences", () => {
        const actual = rendered.getByTestId("tab-link-for-extensions");

        expect(actual).not.toBeNull();
      });

      describe("when navigating to extension preferences using navigation", () => {
        beforeEach(() => {
          applicationBuilder.preferences.navigation.click("extensions");
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows extension specific preferences", () => {
          const page = rendered.getByTestId("extension-preferences-page");

          expect(page).not.toBeNull();
        });

        it("shows extension specific preference item", () => {
          const actual = rendered.getByTestId("extension-preference-item-for-some-preference-item-id");

          expect(actual).not.toBeNull();
        });

        it("does not show unrelated preference tab items", () => {
          const actual = rendered.queryByTestId("extension-preference-item-for-some-unrelated-preference-item-id");

          expect(actual).toBeNull();
        });
      });
    });
  });
});

const extensionStubWithExtensionSpecificPreferenceItems: FakeExtensionData = {
  id: "some-extension-id",
  name: "some-extension-name",
  appPreferences: [
    {
      title: "Some preference item",
      id: "some-preference-item-id",

      components: {
        Hint: () => <div data-testid="some-preference-item-hint" />,
        Input: () => <div data-testid="some-preference-item-input" />,
      },
    },

    {
      title: "irrelevant",
      id: "some-unrelated-preference-item-id",
      showInPreferencesTab: "some-tab",

      components: {
        Hint: () => <div />,
        Input: () => <div />,
      },
    },
  ],
};

