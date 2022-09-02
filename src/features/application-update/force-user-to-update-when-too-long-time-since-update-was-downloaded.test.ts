/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { CheckForPlatformUpdates } from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import type { DownloadPlatformUpdate } from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "../../main/application-update/download-platform-update/download-platform-update.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import processCheckingForUpdatesInjectable from "../../main/application-update/check-for-updates/process-checking-for-updates.injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { advanceFakeTime, useFakeTime } from "../../common/test-utils/use-fake-time";
import quitAndInstallUpdateInjectable from "../../main/application-update/quit-and-install-update.injectable";
import timeAfterUpdateMustBeInstalledInjectable from "../../renderer/application-update/force-update-modal/time-after-update-must-be-installed.injectable";
import secondsAfterInstallStartsInjectable from "../../renderer/application-update/force-update-modal/seconds-after-install-starts.injectable";
import forceUpdateModalRootFrameComponentInjectable from "../../renderer/application-update/force-update-modal/force-update-modal-root-frame-component.injectable";

const TIME_AFTER_UPDATE_MUST_BE_INSTALLED = 1000;
const TIME_AFTER_INSTALL_STARTS = 5 * 1000;

describe("force user to update when too long since update was downloaded", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let downloadPlatformUpdateMock: AsyncFnMock<DownloadPlatformUpdate>;
  let mainDi: DiContainer;
  let quitAndInstallUpdateMock: jest.Mock;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(mainDi => {
      checkForPlatformUpdatesMock = asyncFn();

      mainDi.override(checkForPlatformUpdatesInjectable, () => checkForPlatformUpdatesMock);

      downloadPlatformUpdateMock = asyncFn();

      mainDi.override(downloadPlatformUpdateInjectable, () => downloadPlatformUpdateMock);

      quitAndInstallUpdateMock = jest.fn();

      mainDi.override(quitAndInstallUpdateInjectable, () => quitAndInstallUpdateMock);
    });

    applicationBuilder.beforeWindowStart(windowDi => {
      windowDi.unoverride(forceUpdateModalRootFrameComponentInjectable);
      windowDi.permitSideEffects(forceUpdateModalRootFrameComponentInjectable);

      windowDi.override(timeAfterUpdateMustBeInstalledInjectable, () => TIME_AFTER_UPDATE_MUST_BE_INSTALLED);
      windowDi.override(secondsAfterInstallStartsInjectable, () => TIME_AFTER_INSTALL_STARTS / 1000);
    });

    mainDi = applicationBuilder.mainDi;
  });

  describe("when application is started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    describe("given checking for updates and it resolves, when update was downloaded", () => {
      beforeEach(async () => {
        const processCheckingForUpdates = mainDi.inject(
          processCheckingForUpdatesInjectable,
        );

        processCheckingForUpdates("irrelevant");

        await checkForPlatformUpdatesMock.resolve({
          updateWasDiscovered: true,
          version: "42.0.0",
        });

        await downloadPlatformUpdateMock.resolve({
          downloadWasSuccessful: true,
        });
      });

      it("does not show modal yet", () => {
        expect(rendered.queryByTestId("must-update-immediately")).not.toBeInTheDocument();
      });

      describe("when not enough time passes to consider that update must be installed", () => {
        beforeEach(() => {
          advanceFakeTime(TIME_AFTER_UPDATE_MUST_BE_INSTALLED - 1);
        });

        it("does not show modal yet", () => {
          expect(rendered.queryByTestId("must-update-immediately")).not.toBeInTheDocument();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when enough time passes to consider that update must be installed", () => {
        beforeEach(() => {
          advanceFakeTime(TIME_AFTER_UPDATE_MUST_BE_INSTALLED);
        });

        it("shows modal to inform about forced update", () => {
          expect(rendered.getByTestId("must-update-immediately")).toBeInTheDocument();
        });

        it("when selected to update now, restarts the application to update", () => {
          fireEvent.click(rendered.getByTestId("update-now-from-must-update-immediately-modal"));

          expect(quitAndInstallUpdateMock).toHaveBeenCalled();
        });

        it("shows countdown for automatic update", () => {
          expect(rendered.getByTestId("countdown-to-automatic-update")).toHaveTextContent("5");
        });

        it("when some time passes, updates the countdown for automatic update", () => {
          advanceFakeTime(1000);

          expect(rendered.getByTestId("countdown-to-automatic-update")).toHaveTextContent("4");
        });

        it("when not enough time passes for automatic update, does not restart the application yet", () => {
          advanceFakeTime(TIME_AFTER_INSTALL_STARTS - 1);

          expect(quitAndInstallUpdateMock).not.toHaveBeenCalled();
        });

        it("when enough time passes for automatically update, restarts the application to update", () => {
          advanceFakeTime(TIME_AFTER_INSTALL_STARTS);

          expect(quitAndInstallUpdateMock).toHaveBeenCalled();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });
      });
    });
  });
});
