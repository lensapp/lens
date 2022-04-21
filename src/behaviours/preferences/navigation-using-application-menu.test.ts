/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import isAutoUpdateEnabledInjectable from "../../main/is-auto-update-enabled.injectable";
import type { UserStore } from "../../common/user-store";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import ipcRendererInjectable from "../../renderer/app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

describe("preferences - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi, mainDi }) => {
      mainDi.override(isAutoUpdateEnabledInjectable, () => () => false);

      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
      } as unknown as UserStore;

      rendererDi.override(userStoreInjectable, () => userStoreStub);
      rendererDi.override(ipcRendererInjectable, () => ({
        on: jest.fn(),
        invoke: jest.fn(), // TODO: replace with proper mocking via the IPC bridge
      } as never));
    });

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
