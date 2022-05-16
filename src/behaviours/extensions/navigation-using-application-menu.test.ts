/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import isAutoUpdateEnabledInjectable from "../../main/is-auto-update-enabled.injectable";
import extensionsStoreInjectable from "../../extensions/extensions-store/extensions-store.injectable";
import type { ExtensionsStore } from "../../extensions/extensions-store/extensions-store";
import fileSystemProvisionerStoreInjectable from "../../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store";
import focusWindowInjectable from "../../renderer/ipc-channel-listeners/focus-window.injectable";

// TODO: Make components free of side effects by making them deterministic
jest.mock("../../renderer/components/input/input");

describe("extensions - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;
  let focusWindowMock: jest.Mock;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder().beforeSetups(({ mainDi, rendererDi }) => {
      mainDi.override(isAutoUpdateEnabledInjectable, () => () => false);
      rendererDi.override(extensionsStoreInjectable, () => ({}) as unknown as ExtensionsStore);
      rendererDi.override(fileSystemProvisionerStoreInjectable, () => ({}) as unknown as FileSystemProvisionerStore);

      focusWindowMock = jest.fn();

      rendererDi.override(focusWindowInjectable, () => focusWindowMock);
    });

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show extensions page yet", () => {
    const actual = rendered.queryByTestId("extensions-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to extensions using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("root.extensions");
    });

    it("focuses the window", () => {
      expect(focusWindowMock).toHaveBeenCalled();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows extensions page", () => {
      const actual = rendered.getByTestId("extensions-page");

      expect(actual).not.toBeNull();
    });
  });
});
