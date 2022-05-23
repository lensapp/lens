/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import quitAndInstallUpdateInjectable from "../../main/electron-app/features/quit-and-install-update.injectable";
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
import type { AskBoolean } from "../../main/ask-boolean/ask-boolean.injectable";
import askBooleanInjectable from "../../main/ask-boolean/ask-boolean.injectable";
import showInfoNotificationInjectable from "../../renderer/components/notifications/show-info-notification.injectable";
import processCheckingForUpdatesInjectable from "../../main/application-update/check-for-updates/process-checking-for-updates.injectable";

describe("installing update", () => {
  let applicationBuilder: ApplicationBuilder;
  let quitAndInstallUpdateMock: jest.Mock;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let setUpdateOnQuitMock: jest.Mock;
  let showInfoNotificationMock: jest.Mock;
  let askBooleanMock: AsyncFnMock<AskBoolean>;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
      quitAndInstallUpdateMock = jest.fn();
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();
      setUpdateOnQuitMock = jest.fn();
      showInfoNotificationMock = jest.fn(() => () => {});
      askBooleanMock = asyncFn();

      rendererDi.override(showInfoNotificationInjectable, () => showInfoNotificationMock);

      mainDi.override(askBooleanInjectable, () => askBooleanMock);
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
    let processCheckingForUpdates: () => Promise<void>;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();

      processCheckingForUpdates = applicationBuilder.dis.mainDi.inject(processCheckingForUpdatesInjectable);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when user checks for updates", () => {
      let processCheckingForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        processCheckingForUpdatesPromise = processCheckingForUpdates();
      });

      it("checks for updates", () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          expect.any(Object),
          { allowDowngrade: true },
        );
      });

      it("notifies the user that checking for updates is happening", () => {
        expect(showInfoNotificationMock).toHaveBeenCalledWith("Checking for updates...");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          showInfoNotificationMock.mockClear();

          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });

          await processCheckingForUpdatesPromise;
        });

        it("notifies the user", () => {
          expect(showInfoNotificationMock).toHaveBeenCalledWith("No new updates available");
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

          await processCheckingForUpdatesPromise;
        });

        it("starts downloading the update", () => {
          expect(downloadPlatformUpdateMock).toHaveBeenCalled();
        });

        it("notifies the user that download is happening", () => {
          expect(showInfoNotificationMock).toHaveBeenCalledWith("Download for version some-version started...");
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

          it("notifies the user about failed download", () => {
            expect(showInfoNotificationMock).toHaveBeenCalledWith("Download of update failed");
          });

          it("does not ask user to install update", () => {
            expect(askBooleanMock).not.toHaveBeenCalled();
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

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("asks user to install update immediately", () => {
            expect(askBooleanMock).toHaveBeenCalledWith({
              title: "Update Available",
              question:
                "Version some-version of Lens IDE is available and ready to be installed. Would you like to update now?\n\n" +
                "Lens should restart automatically, if it doesn't please restart manually. Installed extensions might require updating.",
            });
          });

          describe("when user answers to install the update", () => {
            beforeEach(async () => {
              await askBooleanMock.resolve(true);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("quits application and installs the update", () => {
              expect(quitAndInstallUpdateMock).toHaveBeenCalled();
            });
          });

          describe("when user answers not to install the update", () => {
            beforeEach(async () => {
              await askBooleanMock.resolve(false);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("does not quit application and install the update", () => {
              expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});
