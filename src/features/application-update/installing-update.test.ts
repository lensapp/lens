/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import quitAndInstallUpdateInjectable from "../../main/application-update/quit-and-install-update.injectable";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../main/application-update/publish-is-configured.injectable";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import setUpdateOnQuitInjectable from "../../main/electron-app/features/set-update-on-quit.injectable";
import processCheckingForUpdatesInjectable from "../../main/application-update/check-for-updates/process-checking-for-updates.injectable";
import { useFakeTime } from "../../common/test-utils/use-fake-time";
import staticFilesDirectoryInjectable from "../../common/vars/static-files-directory.injectable";

describe("installing update", () => {
  let builder: ApplicationBuilder;
  let quitAndInstallUpdateMock: jest.Mock;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let setUpdateOnQuitMock: jest.Mock;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    builder.beforeApplicationStart((mainDi) => {
      quitAndInstallUpdateMock = jest.fn();
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();
      setUpdateOnQuitMock = jest.fn();

      mainDi.override(staticFilesDirectoryInjectable, () => "/some-static-files-directory");

      mainDi.override(setUpdateOnQuitInjectable, () => setUpdateOnQuitMock);

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(
        downloadPlatformUpdateInjectable,
        () => downloadPlatformUpdateMock,
      );

      mainDi.override(
        quitAndInstallUpdateInjectable,
        () => quitAndInstallUpdateMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);
    });
  });

  describe("when started", () => {
    let rendered: RenderResult;
    let processCheckingForUpdates: (source: string) => Promise<{ updateIsReadyToBeInstalled: boolean }>;

    beforeEach(async () => {
      rendered = await builder.render();

      processCheckingForUpdates = builder.mainDi.inject(
        processCheckingForUpdatesInjectable,
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows normal tray icon", () => {
      expect(builder.tray.getIconPath()).toBe(
        "/some-static-files-directory/icons/trayIconTemplate.png",
      );
    });

    describe("when user checks for updates", () => {
      beforeEach(() => {
        processCheckingForUpdates("irrelevant");
      });

      it("checks for updates", () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          expect.any(Object),
          { allowDowngrade: true },
        );
      });

      it("shows tray icon for checking for updates", () => {
        expect(builder.tray.getIconPath()).toBe(
          "/some-static-files-directory/icons/trayIconCheckingForUpdatesTemplate.png",
        );
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

        it("shows tray icon for normal", () => {
          expect(builder.tray.getIconPath()).toBe(
            "/some-static-files-directory/icons/trayIconTemplate.png",
          );
        });

        it("does not start downloading update", () => {
          expect(downloadPlatformUpdateMock).not.toHaveBeenCalled();
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

        it("starts downloading the update", () => {
          expect(downloadPlatformUpdateMock).toHaveBeenCalled();
        });

        it("still shows tray icon for downloading", () => {
          expect(builder.tray.getIconPath()).toBe(
            "/some-static-files-directory/icons/trayIconCheckingForUpdatesTemplate.png",
          );
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when download fails", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: false });
          });

          it("does not quit and install update yet", () => {
            expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
          });

          it("still shows normal tray icon", () => {
            expect(builder.tray.getIconPath()).toBe(
              "/some-static-files-directory/icons/trayIconTemplate.png",
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });
        });

        describe("when download succeeds", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
          });

          it("does not quit and install update yet", () => {
            expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
          });

          it("shows tray icon for update being available", () => {
            expect(builder.tray.getIconPath()).toBe(
              "/some-static-files-directory/icons/trayIconUpdateAvailableTemplate.png",
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("given checking for updates again", () => {
            beforeEach(() => {
              downloadPlatformUpdateMock.mockClear();

              processCheckingForUpdates("irrelevant");
            });

            it("shows tray icon for checking for updates", () => {
              expect(builder.tray.getIconPath()).toBe(
                "/some-static-files-directory/icons/trayIconCheckingForUpdatesTemplate.png",
              );
            });

            describe("when check resolves with same update that is already downloaded", () => {
              beforeEach(async () => {
                await checkForPlatformUpdatesMock.resolve({
                  updateWasDiscovered: true,
                  version: "some-version",
                });
              });

              it("does not re-download the update", () => {
                expect(downloadPlatformUpdateMock).not.toHaveBeenCalled();
              });

              it("shows tray icon for update being available", () => {
                expect(builder.tray.getIconPath()).toBe(
                  "/some-static-files-directory/icons/trayIconUpdateAvailableTemplate.png",
                );
              });
            });

            describe("when check resolves with different update that was previously downloaded", () => {
              beforeEach(async () => {
                await checkForPlatformUpdatesMock.resolve({
                  updateWasDiscovered: true,
                  version: "some-other-version",
                });
              });

              it("downloads the update", () => {
                expect(downloadPlatformUpdateMock).toHaveBeenCalled();
              });

              it("shows tray icon for downloading update", () => {
                expect(builder.tray.getIconPath()).toBe(
                  "/some-static-files-directory/icons/trayIconCheckingForUpdatesTemplate.png",
                );
              });
            });
          });
        });
      });
    });
  });
});
