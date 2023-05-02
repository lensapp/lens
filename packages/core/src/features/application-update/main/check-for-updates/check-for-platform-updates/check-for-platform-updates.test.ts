/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../../../main/getDiForUnitTesting";
import electronUpdaterInjectable from "../../../../../main/electron-app/features/electron-updater.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { AppUpdater, UpdateCheckResult } from "electron-updater";
import type { CheckForPlatformUpdates } from "./check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "./check-for-platform-updates.injectable";
import type { UpdateChannel, ReleaseChannel } from "../../../common/update-channels";
import { getPromiseStatus } from "@k8slens/test-utils";
import { loggerInjectionToken } from "@k8slens/logger";
import { noop } from "@k8slens/utilities";

describe("check-for-platform-updates", () => {
  let checkForPlatformUpdates: CheckForPlatformUpdates;
  let electronUpdaterFake: AppUpdater;
  let checkForUpdatesMock: AsyncFnMock<() => UpdateCheckResult>;
  let logErrorMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.unoverride(checkForPlatformUpdatesInjectable);

    checkForUpdatesMock = asyncFn();

    electronUpdaterFake = {
      channel: undefined,
      autoDownload: undefined,
      allowDowngrade: undefined,

      checkForUpdates: checkForUpdatesMock,
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

    checkForPlatformUpdates = di.inject(checkForPlatformUpdatesInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<any>;

    beforeEach(() => {
      const testUpdateChannel: UpdateChannel = {
        id: "some-update-channel" as ReleaseChannel,
        label: "Some update channel",
        moreStableUpdateChannel: null,
      };

      actualPromise = checkForPlatformUpdates(testUpdateChannel, { allowDowngrade: true });
    });

    it("sets update channel", () => {
      expect(electronUpdaterFake.channel).toBe("some-update-channel");
    });

    it("sets flag for allowing downgrade", () => {
      expect(electronUpdaterFake.allowDowngrade).toBe(true);
    });

    it("disables auto downloading for being controlled", () => {
      expect(electronUpdaterFake.autoDownload).toBe(false);
    });

    it("checks for updates", () => {
      expect(checkForUpdatesMock).toHaveBeenCalled();
    });

    it("does not resolve yet", async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it("when checking for updates resolves with update, resolves with the discovered update", async () => {
      await checkForUpdatesMock.resolve({
        updateInfo: {
          version: "some-version",
        },

        cancellationToken: "some-cancellation-token",
      } as unknown as UpdateCheckResult);

      const actual = await actualPromise;

      expect(actual).toEqual({ updateWasDiscovered: true, version: "some-version" });
    });

    it("when checking for updates resolves without update, resolves with update not being discovered", async () => {
      await checkForUpdatesMock.resolve({
        updateInfo: {
          version: "some-version-that-matches-to-current-installed-version",
        },

        cancellationToken: null,
      } as unknown as UpdateCheckResult);

      const actual = await actualPromise;

      expect(actual).toEqual({ updateWasDiscovered: false });
    });

    describe("when checking for updates rejects", () => {
      let errorStub: Error;

      beforeEach(() => {
        errorStub = new Error("Some error");

        checkForUpdatesMock.reject(errorStub);
      });

      it("logs errors", () => {
        expect(logErrorMock).toHaveBeenCalledWith("[UPDATE-APP/CHECK-FOR-UPDATES]", errorStub);
      });

      it("resolves with update not being discovered", async () => {
        const actual = await actualPromise;

        expect(actual).toEqual({ updateWasDiscovered: false });
      });
    });
  });
});
