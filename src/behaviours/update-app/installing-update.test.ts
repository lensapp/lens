/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import quitAndInstallUpdateInjectable from "../../main/electron-app/features/quit-and-install-update.injectable";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../main/update-app/publish-is-configured.injectable";
import type { CheckForPlatformUpdates } from "../../main/update-app/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/update-app/check-for-platform-updates/check-for-platform-updates.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { UpdateChannel, UpdateChannelId } from "../../main/update-app/update-channels";
import { updateChannels } from "../../main/update-app/update-channels";
import type { DownloadPlatformUpdate } from "../../main/update-app/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/update-app/download-platform-update/download-platform-update.injectable";
import selectedUpdateChannelInjectable from "../../main/update-app/selected-update-channel.injectable";
import type { IComputedValue } from "mobx";
import setUpdateOnQuitInjectable from "../../main/electron-app/features/set-update-on-quit.injectable";
import type { AskBoolean } from "../../main/ask-boolean/ask-boolean.injectable";
import askBooleanInjectable from "../../main/ask-boolean/ask-boolean.injectable";
import showInfoNotificationInjectable from "../../renderer/components/notifications/show-info-notification.injectable";
import checkForUpdatesInjectable from "../../main/update-app/check-for-updates/check-for-updates.injectable";

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

  describe('given no update is already downloaded, and "latest" update channel is selected, when started', () => {
    let rendered: RenderResult;
    let checkForUpdates: () => Promise<void>;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();

      checkForUpdates = applicationBuilder.dis.mainDi.inject(checkForUpdatesInjectable);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when user checks for updates", () => {
      let checkForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        checkForUpdatesPromise = checkForUpdates();
      });

      it('checks for updates from "latest" update channel', () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          updateChannels.latest,
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

          await checkForUpdatesPromise;
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

          await checkForUpdatesPromise;
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
              id: "install-update",
              title: "Update Available",
              question:
                "Version some-version of Lens IDE is available and ready to be installed. Would you like to update now?",
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

        describe("when user changes update channel to other channel instead of just installing", () => {
          beforeEach(() => {
            const selectedUpdateChannel = applicationBuilder.dis.mainDi.inject(
              selectedUpdateChannelInjectable,
            );

            selectedUpdateChannel.setValue(updateChannels.beta.id);
          });

          it("user cannot install existing update for being from wrong update channel", () => {});

          describe("when user installs an update", () => {
            beforeEach(() => {});

            it('still installs the update from "latest" update channel', () => {});
          });

          it("when checking updates again, checks for updates from the other update channel", async () => {
            checkForPlatformUpdatesMock.mockClear();

            checkForUpdates();

            expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
              updateChannels.beta,
            );
          });
        });
      });
    });

    describe('given update channel "alpha" is selected, when checking for updates', () => {
      let selectedUpdateChannel: {
        value: IComputedValue<UpdateChannel>;
        setValue: (channelId: UpdateChannelId) => void;
      };

      beforeEach(() => {
        selectedUpdateChannel = applicationBuilder.dis.mainDi.inject(
          selectedUpdateChannelInjectable,
        );

        selectedUpdateChannel.setValue(updateChannels.alpha.id);

        checkForUpdates();
      });

      it('checks updates from update channel "alpha"', () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          updateChannels.alpha,
        );
      });

      it("when update is discovered, does not check update from other update channels", async () => {
        checkForPlatformUpdatesMock.mockClear();

        await checkForPlatformUpdatesMock.resolve({
          updateWasDiscovered: true,
          version: "some-version",
        });

        expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
      });

      describe("when no update is discovered", () => {
        beforeEach(async () => {
          checkForPlatformUpdatesMock.mockClear();

          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });
        });

        it('checks updates from update channel "beta"', () => {
          expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
            updateChannels.beta,
          );
        });

        it("when update is discovered, does not check update from other update channels", async () => {
          checkForPlatformUpdatesMock.mockClear();

          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });

          expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
        });

        describe("when no update is discovered again", () => {
          beforeEach(async () => {
            checkForPlatformUpdatesMock.mockClear();

            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: false,
            });
          });

          it('finally checks updates from update channel "latest"', () => {
            expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
              updateChannels.latest,
            );
          });

          it("when update is discovered, does not check update from other update channels", async () => {
            checkForPlatformUpdatesMock.mockClear();

            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: true,
              version: "some-version",
            });

            expect(checkForPlatformUpdatesMock).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('given update channel "beta" is selected', () => {
      let selectedUpdateChannel: {
        value: IComputedValue<UpdateChannel>;
        setValue: (channelId: UpdateChannelId) => void;
      };

      beforeEach(() => {
        selectedUpdateChannel = applicationBuilder.dis.mainDi.inject(
          selectedUpdateChannelInjectable,
        );

        selectedUpdateChannel.setValue(updateChannels.beta.id);
      });

      describe("when checking for updates", () => {
        beforeEach(() => {
          checkForUpdates();
        });

        describe('when update from "beta" channel is discovered', () => {
          beforeEach(async () => {
            await checkForPlatformUpdatesMock.resolve({
              updateWasDiscovered: true,
              version: "some-beta-version",
            });
          });

          describe("when update is downloaded", () => {
            beforeEach(async () => {
              await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
            });

            it("when user would close the application, installs the update", () => {
              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(true);
            });

            it('given user changes update channel to "latest", when user would close the application, does not install the update for not being stable enough', () => {
              selectedUpdateChannel.setValue(updateChannels.latest.id);

              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(false);
            });

            it('given user changes update channel to "alpha", when user would close the application, installs the update for being stable enough', () => {
              selectedUpdateChannel.setValue(updateChannels.alpha.id);

              expect(setUpdateOnQuitMock).toHaveBeenLastCalledWith(false);
            });
          });
        });
      });
    });
  });
});
