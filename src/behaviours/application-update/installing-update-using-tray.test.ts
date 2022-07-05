/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../main/application-update/publish-is-configured.injectable";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import showApplicationWindowInjectable from "../../main/start-main-application/lens-window/show-application-window.injectable";

describe("installing update using tray", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let showApplicationWindowMock: jest.Mock;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();
      showApplicationWindowMock = jest.fn();

      mainDi.override(showApplicationWindowInjectable, () => showApplicationWindowMock);

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(
        downloadPlatformUpdateInjectable,
        () => downloadPlatformUpdateMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);
    });
  });

  describe("when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("user cannot install update yet", () => {
      expect(applicationBuilder.tray.get("install-update")).toBeNull();
    });

    describe("when user checks for updates using tray", () => {
      let processCheckingForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        processCheckingForUpdatesPromise = applicationBuilder.tray.click("check-for-updates");
      });

      it("does not show application window yet", () => {
        expect(showApplicationWindowMock).not.toHaveBeenCalled();
      });

      it("user cannot check for updates again", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates")?.enabled,
        ).toBe(false);
      });

      it("name of tray item for checking updates indicates that checking is happening", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates")?.label,
        ).toBe("Checking for updates...");
      });

      it("user cannot install update yet", () => {
        expect(applicationBuilder.tray.get("install-update")).toBeNull();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });

          await processCheckingForUpdatesPromise;
        });

        it("shows application window", () => {
          expect(showApplicationWindowMock).toHaveBeenCalled();
        });

        it("user cannot install update", () => {
          expect(applicationBuilder.tray.get("install-update")).toBeNull();
        });

        it("user can check for updates again", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates")?.enabled,
          ).toBe(true);
        });

        it("name of tray item for checking updates no longer indicates that checking is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates")?.label,
          ).toBe("Check for updates");
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });
      });

      describe("when new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });

          await processCheckingForUpdatesPromise;
        });

        it("shows application window", () => {
          expect(showApplicationWindowMock).toHaveBeenCalled();
        });

        it("user cannot check for updates again yet", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates")?.enabled,
          ).toBe(false);
        });

        it("name of tray item for checking updates indicates that downloading is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates")?.label,
          ).toBe("Downloading update some-version (0%)...");
        });

        it("when download progresses with decimals, percentage increases as integers", () => {
          downloadPlatformUpdateMock.mock.calls[0][0]({ percentage: 42.424242 });

          expect(
            applicationBuilder.tray.get("check-for-updates")?.label,
          ).toBe("Downloading update some-version (42%)...");
        });

        it("user still cannot install update", () => {
          expect(applicationBuilder.tray.get("install-update")).toBeNull();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when download fails", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: false });
          });

          it("user cannot install update", () => {
            expect(
              applicationBuilder.tray.get("install-update"),
            ).toBeNull();
          });

          it("user can check for updates again", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates")?.enabled,
            ).toBe(true);
          });

          it("name of tray item for checking updates no longer indicates that downloading is happening", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates")?.label,
            ).toBe("Check for updates");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });
        });

        describe("when download succeeds", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
          });

          it("user can install update", () => {
            expect(
              applicationBuilder.tray.get("install-update")?.label,
            ).toBe("Install update some-version");
          });

          it("user can check for updates again", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates")?.enabled,
            ).toBe(true);
          });

          it("name of tray item for checking updates no longer indicates that downloading is happening", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates")?.label,
            ).toBe("Check for updates");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });
        });
      });
    });
  });
});
