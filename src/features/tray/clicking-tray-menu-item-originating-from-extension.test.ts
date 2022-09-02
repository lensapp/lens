/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import loggerInjectable from "../../common/logger.injectable";
import type { Logger } from "../../common/logger";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("clicking tray menu item originating from extension", () => {
  let builder: ApplicationBuilder;
  let logErrorMock: jest.Mock;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart((mainDi) => {
      logErrorMock = jest.fn();

      mainDi.override(loggerInjectable, () => ({ error: logErrorMock }) as unknown as Logger);
      mainDi.override(getRandomIdInjectable, () => () => "some-random-id");
    });

    await builder.render();
  });

  describe("when extension is enabled", () => {
    let someExtension: FakeExtensionOptions;
    let clickMock: jest.Mock;

    beforeEach(() => {
      clickMock = jest.fn();

      someExtension = {
        id: "some-extension-id",
        name: "some-extension-name",
        mainOptions: {
          trayMenus: [{ label: "some-label", click: clickMock }],
        },
      };

      builder.extensions.enable(someExtension);
    });

    it("when item is clicked, triggers the click handler", () => {
      builder.tray.click(
        "some-random-id-tray-menu-item-for-extension-some-extension-name",
      );

      expect(clickMock).toHaveBeenCalled();
    });

    describe("given click handler throws synchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => {
          throw new Error("some-error");
        });

        builder.tray.click(
          "some-random-id-tray-menu-item-for-extension-some-extension-name",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-random-id" from extension "some-extension-name" failed.',
          expect.any(Error),
        );
      });
    });

    describe("given click handler rejects asynchronously, when item is clicked", () => {
      beforeEach(() => {
        clickMock.mockImplementation(() => Promise.reject("some-rejection"));

        builder.tray.click(
          "some-random-id-tray-menu-item-for-extension-some-extension-name",
        );
      });

      it("logs the error", () => {
        expect(logErrorMock).toHaveBeenCalledWith(
          '[TRAY]: Clicking of tray item "some-random-id" from extension "some-extension-name" failed.',
          "some-rejection",
        );
      });
    });

    describe("when extension is disabled", () => {
      beforeEach(() => {
        builder.extensions.disable(someExtension);
      });

      it("does not have the tray menu item from extension", () => {
        expect(
          builder.tray.get(
            "some-random-id-tray-menu-item-for-extension-some-extension-name",
          ),
        ).toBeNull();
      });

      // Note: Motivation here is to make sure that enabling same extension does not throw
      it("when extension is re-enabled, has the tray menu item from extension", async () => {
        await builder.extensions.enable(someExtension);

        expect(
          builder.tray.get(
            "some-random-id-tray-menu-item-for-extension-some-extension-name",
          ),
        ).not.toBeNull();
      });
    });
  });
});
