import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import publishIsConfiguredInjectable from "../../main/application-update/publish-is-configured.injectable";
import periodicalCheckForUpdateWarningInjectable from "../../main/application-update/update-warning-level/periodical-check-for-update-warning.injectable";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import closeWindowInjectable from "../../renderer/components/layout/top-bar/close-window.injectable";
import goBackInjectable from "../../renderer/components/layout/top-bar/go-back.injectable";
import goForwardInjectable from "../../renderer/components/layout/top-bar/go-forward.injectable";
import maximizeWindowInjectable from "../../renderer/components/layout/top-bar/maximize-window.injectable";
import openAppContextMenuInjectable from "../../renderer/components/layout/top-bar/open-app-context-menu.injectable";
import toggleMaximizeWindowInjectable from "../../renderer/components/layout/top-bar/toggle-maximize-window.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("encourage user to update when sufficient time passed since update was downloaded", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
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

      mainDi.unoverride(periodicalCheckForUpdateWarningInjectable);
      mainDi.permitSideEffects(periodicalCheckForUpdateWarningInjectable);

      // TODO: Remove below lines when TopBar are free from side-effects
      rendererDi.unoverride(openAppContextMenuInjectable);
      rendererDi.unoverride(goBackInjectable);
      rendererDi.unoverride(goForwardInjectable);
      rendererDi.unoverride(closeWindowInjectable);
      rendererDi.unoverride(maximizeWindowInjectable);
      rendererDi.unoverride(toggleMaximizeWindowInjectable);

      rendererDi.permitSideEffects(openAppContextMenuInjectable);
      rendererDi.permitSideEffects(goBackInjectable);
      rendererDi.permitSideEffects(goForwardInjectable);
      rendererDi.permitSideEffects(closeWindowInjectable);
      rendererDi.permitSideEffects(maximizeWindowInjectable);
      rendererDi.permitSideEffects(toggleMaximizeWindowInjectable);
    })
  });

  describe("when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show update button yet", () => {
      const button = rendered.queryByTestId("update-button");

      expect(button).toBeNull();
    });

    describe("given the update check", () => {
      let processCheckingForUpdatesPromise: Promise<void>;

      beforeEach(async () => {
        // TODO: initiate update check process automatically, not from tray
        processCheckingForUpdatesPromise = applicationBuilder.tray.click("check-for-updates");
      });

      describe("when update downloaded", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: true,
            version: "some-version",
          });
          await downloadPlatformUpdateMock.resolve({ downloadWasSuccessful: true });
          await processCheckingForUpdatesPromise;
        });

        it("shows update button to help user to update", () => {
          const button = rendered.queryByTestId("update-button");
  
          expect(button).toBeInTheDocument();
        })
      });
    });
  });
});