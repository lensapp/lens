/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../main/update-app/publish-is-configured.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import checkForUpdatesInjectable from "../../main/update-app/check-for-updates/check-for-updates.injectable";
import startCheckingForUpdatesInjectable
  from "../../main/update-app/periodical-check-for-updates/start-checking-for-updates.injectable";

const ENOUGH_TIME = 1000 * 60 * 60 * 2;

describe("checking for updates automatically", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForUpdatesMock: AsyncFnMock<() => Promise<void>>;

  beforeEach(() => {
    jest.useFakeTimers();

    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      mainDi.unoverride(startCheckingForUpdatesInjectable);

      checkForUpdatesMock = asyncFn();

      mainDi.override(
        checkForUpdatesInjectable,
        () => checkForUpdatesMock,
      );
    });
  });

  describe("given updater is enabled and configuration exists, when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => true);
        mainDi.override(publishIsConfiguredInjectable, () => true);
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("checks for updates", () => {
      expect(checkForUpdatesMock).toHaveBeenCalled();
    });

    it("when just not enough time passes, does not check for updates again automatically yet", () => {
      checkForUpdatesMock.mockClear();

      jest.advanceTimersByTime(ENOUGH_TIME - 1);

      expect(checkForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when just enough time passes, checks for updates again automatically", () => {
      checkForUpdatesMock.mockClear();

      jest.advanceTimersByTime(ENOUGH_TIME);

      expect(checkForUpdatesMock).toHaveBeenCalled();
    });
  });

  describe("given updater is enabled but no configuration exist, when started", () => {
    beforeEach(async () => {
      applicationBuilder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => true);
        mainDi.override(publishIsConfiguredInjectable, () => false);
      });

      await applicationBuilder.render();
    });

    it("does not check for updates", () => {
      expect(checkForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when enough time passes for checking updates again, still does not check for updates", () => {
      jest.advanceTimersByTime(ENOUGH_TIME);

      expect(checkForUpdatesMock).not.toHaveBeenCalled();
    });
  });

  describe("given updater is not enabled but and configuration exist, when started", () => {
    beforeEach(async () => {
      applicationBuilder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => false);
        mainDi.override(publishIsConfiguredInjectable, () => true);
      });

      await applicationBuilder.render();
    });

    it("does not check for updates", () => {
      expect(checkForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when enough time passes for checking updates again, still does not check for updates", () => {
      jest.advanceTimersByTime(ENOUGH_TIME);

      expect(checkForUpdatesMock).not.toHaveBeenCalled();
    });
  });
});
