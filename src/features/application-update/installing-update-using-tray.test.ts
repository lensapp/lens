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
import type { LensWindow } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import getCurrentApplicationWindowInjectable from "../../main/start-main-application/lens-window/application-window/get-current-application-window.injectable";

describe("installing update using tray", () => {
  let builder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart((mainDi) => {
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();

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
      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("user cannot install update yet", () => {
      expect(builder.tray.get("install-update")).toBeNull();
    });

    describe("given all application windows are closed, when checking for updates", () => {
      let getCurrentApplicationWindow: () => LensWindow | undefined;

      beforeEach(() => {
        getCurrentApplicationWindow = builder.mainDi.inject(
          getCurrentApplicationWindowInjectable,
        );

        builder.applicationWindow.closeAll();

        builder.tray.click("check-for-updates");
      });

      describe("when check for update resolves with new update", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });
        });

        it("does not show application window yet", () => {
          const actual = getCurrentApplicationWindow();

          expect(actual).toBeUndefined();
        });

        describe("when download of update resolves with success", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
          });

          it("shows the application window", () => {
            const actual = getCurrentApplicationWindow();

            expect(actual).not.toBeUndefined();
          });

          it("given closing application window again and checking for updates again using tray, when check resolves with same version that was earlier downloaded, shows the application window", async () => {
            builder.applicationWindow.closeAll();

            builder.tray.click("check-for-updates");

            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: true,
              version: "some-version",
            });

            const actual = getCurrentApplicationWindow();

            expect(actual).not.toBeUndefined();
          });
        });

        it("when download of update resolves with failure, does not show the application window", async () => {
          await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: false });

          const actual = getCurrentApplicationWindow();

          expect(actual).toBeUndefined();
        });
      });

      it("when process resolves without new update, does not show the application window", async () => {
        await checkForPlatformUpdatesMock.resolve({
          updateWasDiscovered: false,
        });

        const actual = getCurrentApplicationWindow();

        expect(actual).toBeUndefined();
      });
    });

    describe("when user checks for updates using tray", () => {
      beforeEach(() => {
        builder.tray.click("check-for-updates");
      });

      it("user cannot check for updates again", () => {
        expect(
          builder.tray.get("check-for-updates")?.enabled,
        ).toBe(false);
      });

      it("name of tray item for checking updates indicates that checking is happening", () => {
        expect(
          builder.tray.get("check-for-updates")?.label,
        ).toBe("Checking for updates...");
      });

      it("user cannot install update yet", () => {
        expect(builder.tray.get("install-update")).toBeNull();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });
        });

        it("user cannot install update", () => {
          expect(builder.tray.get("install-update")).toBeNull();
        });

        it("user can check for updates again", () => {
          expect(
            builder.tray.get("check-for-updates")?.enabled,
          ).toBe(true);
        });

        it("name of tray item for checking updates no longer indicates that checking is happening", () => {
          expect(
            builder.tray.get("check-for-updates")?.label,
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
        });

        it("user cannot check for updates again yet", () => {
          expect(
            builder.tray.get("check-for-updates")?.enabled,
          ).toBe(false);
        });

        it("name of tray item for checking updates indicates that downloading is happening", () => {
          expect(
            builder.tray.get("check-for-updates")?.label,
          ).toBe("Downloading update some-version (0%)...");
        });

        it("when download progresses with decimals, percentage increases as integers", () => {
          downloadPlatformUpdateMock.mock.calls[0][0]({ percentage: 42.424242 });

          expect(
            builder.tray.get("check-for-updates")?.label,
          ).toBe("Downloading update some-version (42%)...");
        });

        it("user still cannot install update", () => {
          expect(builder.tray.get("install-update")).toBeNull();
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
              builder.tray.get("install-update"),
            ).toBeNull();
          });

          it("user can check for updates again", () => {
            expect(
              builder.tray.get("check-for-updates")?.enabled,
            ).toBe(true);
          });

          it("name of tray item for checking updates no longer indicates that downloading is happening", () => {
            expect(
              builder.tray.get("check-for-updates")?.label,
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
              builder.tray.get("install-update")?.label,
            ).toBe("Install update some-version");
          });

          it("user can check for updates again", () => {
            expect(
              builder.tray.get("check-for-updates")?.enabled,
            ).toBe(true);
          });

          it("name of tray item for checking updates no longer indicates that downloading is happening", () => {
            expect(
              builder.tray.get("check-for-updates")?.label,
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
