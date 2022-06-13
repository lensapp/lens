/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { LensMainExtension } from "../../extensions/lens-main-extension";
import type { TrayMenuRegistration } from "../../main/tray/tray-menu-registration";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import loggerInjectable from "../../common/logger.injectable";
import type { Logger } from "../../common/logger";

describe("clicking tray menu item originating from extension", () => {
  let applicationBuilder: ApplicationBuilder;
  let logErrorMock: jest.Mock;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      logErrorMock = jest.fn();

      mainDi.override(loggerInjectable, () => ({ error: logErrorMock }) as unknown as Logger);
    });

    await applicationBuilder.render();
  });

  describe("when extension is enabled", () => {
    let someExtension: SomeTestExtension;
    let clickMock: jest.Mock;

    beforeEach(async () => {
      clickMock = jest.fn();

      someExtension = new SomeTestExtension({
        id: "some-extension-id",
        trayMenus: [{ label: "some-label", click: clickMock }],
      });

      await applicationBuilder.addMainExtensions(someExtension);
    });

    it("when item is clicked, triggers the click handler", () => {
      applicationBuilder.tray.click(
        "some-label-tray-menu-item-for-extension-some-extension-id-instance-1",
      );

      expect(clickMock).toHaveBeenCalled();
    });

    describe("given click handler throws synchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => {
          throw new Error("some-error");
        });

        applicationBuilder.tray.click(
          "some-label-tray-menu-item-for-extension-some-extension-id-instance-1",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-label" from extension "some-extension-id" failed.',
          expect.any(Error),
        );
      });
    });

    describe("given click handler rejects asynchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => Promise.reject("some-rejection"));

        applicationBuilder.tray.click(
          "some-label-tray-menu-item-for-extension-some-extension-id-instance-1",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-label" from extension "some-extension-id" failed.',
          "some-rejection",
        );
      });
    });

    it("when disabling extension, does not have tray menu items", () => {
      applicationBuilder.removeMainExtensions(someExtension);

      expect(
        applicationBuilder.tray.get(
          "some-label-tray-menu-item-for-extension-some-extension-id-instance-1",
        ),
      ).toBeNull();
    });
  });
});

class SomeTestExtension extends LensMainExtension {
  constructor({ id, trayMenus }: {
     id: string;
     trayMenus: TrayMenuRegistration[];
   }) {
    super({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: id, version: "some-version", engines: { lens: "^5.5.0" }},
      manifestPath: "irrelevant",
    });

    this.trayMenus = trayMenus;
  }
}
