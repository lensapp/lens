/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../../../main/getDiForUnitTesting";
import electronUpdaterInjectable from "../../../../../main/electron-app/features/electron-updater.injectable";
import type { DownloadPlatformUpdate } from "./download-platform-update.injectable";
import downloadPlatformUpdateInjectable from "./download-platform-update.injectable";
import type { AppUpdater } from "electron-updater";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getPromiseStatus } from "@k8slens/test-utils";
import type { DiContainer } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { noop } from "@k8slens/utilities";

describe("download-platform-update", () => {
  let downloadPlatformUpdate: DownloadPlatformUpdate;
  let downloadUpdateMock: AsyncFnMock<() => void>;
  let electronUpdaterFake: AppUpdater;
  let electronUpdaterOnMock: jest.Mock;
  let electronUpdaterOffMock: jest.Mock;
  let di: DiContainer;
  let logErrorMock: jest.Mock;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.unoverride(downloadPlatformUpdateInjectable);

    downloadUpdateMock = asyncFn();
    electronUpdaterOnMock = jest.fn();
    electronUpdaterOffMock = jest.fn();

    electronUpdaterFake = {
      channel: undefined,
      autoDownload: undefined,

      on: electronUpdaterOnMock,
      off: electronUpdaterOffMock,

      downloadUpdate: downloadUpdateMock,
    } as unknown as AppUpdater;

    di.override(electronUpdaterInjectable, () => electronUpdaterFake);

    logErrorMock = jest.fn();
    di.override(loggerInjectionToken, () => ({
      error: logErrorMock,
      debug: noop,
      info: noop,
      silly: noop,
      warn: noop,
    }));

    downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<{ downloadWasSuccessful: boolean }>;
    let onDownloadProgressMock: jest.Mock;

    beforeEach(() => {
      onDownloadProgressMock = jest.fn();

      actualPromise = downloadPlatformUpdate(onDownloadProgressMock);
    });

    it("calls for downloading of update", () => {
      expect(downloadUpdateMock).toHaveBeenCalled();
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("starts progress of download from 0", () => {
      expect(onDownloadProgressMock).toHaveBeenCalledWith({ percentage: 0 });
    });

    describe("when downloading progresses", () => {
      beforeEach(() => {
        onDownloadProgressMock.mockClear();

        const [, callback] = electronUpdaterOnMock.mock.calls.find(
          ([event]) => event === "download-progress",
        );

        callback({
          percent: 42,
          total: 0,
          delta: 0,
          transferred: 0,
          bytesPerSecond: 0,
        });
      });

      it("updates progress of the download", () => {
        expect(onDownloadProgressMock).toHaveBeenCalledWith({ percentage: 42 });
      });

      describe("when downloading resolves", () => {
        beforeEach(async () => {
          onDownloadProgressMock.mockClear();

          await downloadUpdateMock.resolve();
        });

        it("resolves with success", async () => {
          const actual = await actualPromise;

          expect(actual).toEqual({ downloadWasSuccessful: true });
        });

        it("does not reset progress of download yet", () => {
          expect(onDownloadProgressMock).not.toHaveBeenCalled();
        });

        it("stops watching for download progress", () => {
          expect(electronUpdaterOffMock).toHaveBeenCalledWith(
            "download-progress",
            expect.any(Function),
          );
        });

        it("when starting download again, resets progress of download", () => {
          downloadPlatformUpdate(onDownloadProgressMock);

          expect(onDownloadProgressMock).toHaveBeenCalledWith({ percentage: 0 });
        });
      });

      describe("when downloading rejects", () => {
        let errorStub: Error;

        beforeEach(() => {
          errorStub = new Error("Some error");

          downloadUpdateMock.reject(errorStub);
        });

        it("logs error", () => {
          expect(logErrorMock).toHaveBeenCalledWith("[UPDATE-APP/DOWNLOAD]", errorStub);
        });

        it("stops watching for download progress", () => {
          expect(electronUpdaterOffMock).toHaveBeenCalledWith(
            "download-progress",
            expect.any(Function),
          );
        });

        it("resolves with failure", async () => {
          const actual = await actualPromise;

          expect(actual).toEqual({ downloadWasSuccessful: false });
        });
      });
    });
  });
});
