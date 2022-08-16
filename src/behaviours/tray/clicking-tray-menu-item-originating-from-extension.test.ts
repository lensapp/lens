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
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("clicking tray menu item originating from extension", () => {
  let applicationBuilder: ApplicationBuilder;
  let logErrorMock: jest.Mock;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      logErrorMock = jest.fn();

      mainDi.override(loggerInjectable, () => ({ error: logErrorMock }) as unknown as Logger);
      mainDi.override(getRandomIdInjectable, () => () => "some-random-id");
    });

    await applicationBuilder.render();
  });

  describe("when extension is enabled", () => {
    let someExtension: SomeTestExtension;
    let clickMock: jest.Mock;

    beforeEach(() => {
      clickMock = jest.fn();

      someExtension = new SomeTestExtension({
        id: "some-extension-id",
        trayMenus: [{ label: "some-label", click: clickMock }],
      });

      applicationBuilder.extensions.main.enable(someExtension);
    });

    it("when item is clicked, triggers the click handler", () => {
      applicationBuilder.tray.click(
        "some-random-id-tray-menu-item-for-extension-some-extension-id",
      );

      expect(clickMock).toHaveBeenCalled();
    });

    describe("given click handler throws synchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => {
          throw new Error("some-error");
        });

        applicationBuilder.tray.click(
          "some-random-id-tray-menu-item-for-extension-some-extension-id",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-random-id" from extension "some-extension-id" failed.',
          expect.any(Error),
        );
      });
    });

    describe("given click handler rejects asynchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => Promise.reject("some-rejection"));

        applicationBuilder.tray.click(
          "some-random-id-tray-menu-item-for-extension-some-extension-id",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-random-id" from extension "some-extension-id" failed.',
          "some-rejection",
        );
      });
    });

    describe("when extension is disabled", () => {
      beforeEach(() => {
        applicationBuilder.extensions.main.disable(someExtension);
      });

      it("does not have the tray menu item from extension", () => {
        expect(
          applicationBuilder.tray.get(
            "some-random-id-tray-menu-item-for-extension-some-extension-id",
          ),
        ).toBeNull();
      });

      // Note: Motivation here is to make sure that enabling same extension does not throw
      it("when extension is re-enabled, has the tray menu item from extension", async () => {
        await applicationBuilder.extensions.main.enable(someExtension);

        expect(
          applicationBuilder.tray.get(
            "some-random-id-tray-menu-item-for-extension-some-extension-id",
          ),
        ).not.toBeNull();
      });
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
