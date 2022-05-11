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
import type { CheckForPlatformUpdates } from "../../main/update-app/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/update-app/check-for-platform-updates.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { UpdateChannel, UpdateChannelId } from "../../main/update-app/update-channels";
import { updateChannels } from "../../main/update-app/update-channels";
import downloadPlatformUpdateInjectable from "../../main/update-app/download-platform-update.injectable";
import selectedUpdateChannelInjectable from "../../main/update-app/selected-update-channel.injectable";
import progressOfUpdateDownloadInjectable from "../../main/update-app/progress-of-update-download.injectable";
import type { IComputedValue } from "mobx";
import setUpdateOnQuitInjectable from "../../main/electron-app/features/set-update-on-quit.injectable";
import showApplicationWindowInjectable from "../../main/start-main-application/lens-window/show-application-window.injectable";

describe("installing update using tray", () => {
  let applicationBuilder: ApplicationBuilder;
  let quitAndInstallUpdateMock: jest.Mock;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<() => void>;
  let setUpdateOnQuitMock: jest.Mock;
  let showApplicationWindowMock: jest.Mock;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      quitAndInstallUpdateMock = jest.fn();
      checkForPlatformUpdatesMock = asyncFn();
      downloadPlatformUpdateMock = asyncFn();
      setUpdateOnQuitMock = jest.fn();
      showApplicationWindowMock = jest.fn();

      mainDi.override(showApplicationWindowInjectable, () => showApplicationWindowMock);

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

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("user cannot install update yet", () => {
      expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
    });

    describe("when user checks for updates using tray", () => {
      let checkForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        checkForUpdatesPromise =
          applicationBuilder.tray.click("check-for-updates");
      });

      it('checks for updates from "latest" update channel', () => {
        expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(
          updateChannels.latest,
        );
      });

      it("does not show application window yet", () => {
        expect(showApplicationWindowMock).not.toHaveBeenCalled();
      });

      xit("notifies the user that checking for updates is happening", () => {});

      it("user cannot check for updates again", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates").enabled.get(),
        ).toBe(false);
      });

      it("name of tray item for checking updates indicates that checking is happening", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates").label.get(),
        ).toBe("Checking for updates...");
      });

      it("user cannot install update yet", () => {
        expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });

          await checkForUpdatesPromise;
        });

        it("shows application window", () => {
          expect(showApplicationWindowMock).toHaveBeenCalled();
        });

        xit("notifies the user", () => {});

        it("does not start downloading update", () => {
          expect(downloadPlatformUpdateMock).not.toHaveBeenCalled();
        });

        it("user cannot install update", () => {
          expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
        });

        it("user can check for updates again", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").enabled.get(),
          ).toBe(true);
        });

        it("name of tray item for checking updates no longer indicates that checking is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").label.get(),
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

          await checkForUpdatesPromise;
        });

        it("shows application window", () => {
          expect(showApplicationWindowMock).toHaveBeenCalled();
        });

        it("starts downloading the update", () => {
          expect(downloadPlatformUpdateMock).toHaveBeenCalled();
        });

        xit("notifies the user that download is happening", () => {});

        it("user cannot check for updates again yet", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").enabled.get(),
          ).toBe(false);
        });

        it("name of tray item for checking updates indicates that downloading is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").label.get(),
          ).toBe('Downloading update "some-version" (0%)...');
        });

        it("when download progresses, percentage increases", () => {
          const progressOfUpdateDownload = applicationBuilder.dis.mainDi.inject(
            progressOfUpdateDownloadInjectable,
          );

          progressOfUpdateDownload.setValue(42);

          expect(
            applicationBuilder.tray.get("check-for-updates").label.get(),
          ).toBe('Downloading update "some-version" (42%)...');
        });

        it("user still cannot install update", () => {
          expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when update is downloaded", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve();
          });

          it("does not quit and install update yet", () => {
            expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
          });

          it("user can install update", () => {
            expect(
              applicationBuilder.tray.get("install-update").label.get(),
            ).toBe('Install update "some-version"');
          });

          it("user can check for updates again", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates").enabled.get(),
            ).toBe(true);
          });

          it("name of tray item for checking updates no longer indicates that downloading is happening", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates").label.get(),
            ).toBe("Check for updates");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when user installs the update", () => {
            beforeEach(async () => {
              await applicationBuilder.tray.click("install-update");
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("quits application and installs update", () => {
              expect(quitAndInstallUpdateMock).toHaveBeenCalled();
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

            applicationBuilder.tray.click("check-for-updates");

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

        applicationBuilder.tray.click("check-for-updates");
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
          applicationBuilder.tray.click("check-for-updates");
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
              await downloadPlatformUpdateMock.resolve();
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

  xdescribe("given a non-installed update is already downloaded, when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("user can check for updates", () => {
      expect(
        applicationBuilder.tray.get("check-for-updates").enabled.get(),
      ).toBe(true);
    });

    it("user can install the update", () => {
      expect(applicationBuilder.tray.get("install-update").label.get()).toBe(
        'Install update "some-old-version"',
      );
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when user installs the update", () => {
      beforeEach(() => {});

      it("quits application and installs update", () => {});

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe("when user checks for even newer update", () => {
      let checkForUpdatesPromise: Promise<void>;

      beforeEach(() => {
        checkForUpdatesPromise =
          applicationBuilder.tray.click("check-for-updates");
      });

      it("user cannot check for updates again", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates").enabled.get(),
        ).toBe(false);
      });

      it("user cannot install any update", () => {
        expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
      });

      it("name of tray item indicates that checking is happening", () => {
        expect(
          applicationBuilder.tray.get("check-for-updates").label.get(),
        ).toBe("Checking for updates...");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });

          await checkForUpdatesPromise;
        });

        xit("notifies the user about the old update", () => {});

        it("user can check for updates again", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").enabled.get(),
          ).toBe(true);
        });

        it("user can still install the old update", () => {
          expect(
            applicationBuilder.tray.get("install-update").label.get(),
          ).toBe('Install update "some-old-version"');
        });

        it("name of tray item for checking update no longer indicates that checking is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").label.get(),
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
            version: "some-newer-version",
          });

          await checkForUpdatesPromise;
        });

        it("starts downloading the update", () => {
          expect(downloadPlatformUpdateMock).toHaveBeenCalled();
        });

        it("user cannot check for updates again yet", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").enabled.get(),
          ).toBe(false);
        });

        it("name of tray item still indicates that download is happening", () => {
          expect(
            applicationBuilder.tray.get("check-for-updates").label.get(),
          ).toBe('Downloading update "some-newer-version"...');
        });

        it("user cannot install any update yet", () => {
          expect(applicationBuilder.tray.get("install-update")).toBeUndefined();
        });

        xit("notifies the user that download of new update is happening", () => {});

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when new update is downloaded", () => {
          beforeEach(async () => {
            await downloadPlatformUpdateMock.resolve();
          });

          it("user can install the new update", () => {
            expect(
              applicationBuilder.tray.get("install-update").label.get(),
            ).toBe('Install update "some-new-version"');
          });

          it("user can check for updates again", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates").enabled.get(),
            ).toBe(true);
          });

          it("name of tray item no longer indicates that checking is happening", () => {
            expect(
              applicationBuilder.tray.get("check-for-updates").label.get(),
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
