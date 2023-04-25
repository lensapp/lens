/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import type { RenderResult } from "@testing-library/react";
import electronUpdaterIsActiveInjectable from "../../../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "../../child-features/updating-is-enabled/main/publish-is-configured.injectable";
import processCheckingForUpdatesInjectable from "../../main/process-checking-for-updates.injectable";
import periodicalCheckForUpdatesInjectable from "./main/periodical-check-for-updates.injectable";
import { testUsingFakeTime, advanceFakeTime } from "../../../../test-utils/use-fake-time";

const ENOUGH_TIME = 1000 * 60 * 60 * 2;

describe("periodical checking of updates", () => {
  let builder: ApplicationBuilder;
  let processCheckingForUpdatesMock: jest.Mock;

  beforeEach(() => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.unoverride(periodicalCheckForUpdatesInjectable);
      mainDi.permitSideEffects(periodicalCheckForUpdatesInjectable);

      processCheckingForUpdatesMock = jest.fn();

      mainDi.override(
        processCheckingForUpdatesInjectable,
        () => processCheckingForUpdatesMock,
      );
    });
  });

  describe("given updater is enabled and configuration exists, when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => true);
        mainDi.override(publishIsConfiguredInjectable, () => true);
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("checks for updates", () => {
      expect(processCheckingForUpdatesMock).toHaveBeenCalled();
    });

    it("when just not enough time passes, does not check for updates again automatically yet", () => {
      processCheckingForUpdatesMock.mockClear();

      advanceFakeTime(ENOUGH_TIME - 1);

      expect(processCheckingForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when just enough time passes, checks for updates again automatically", () => {
      processCheckingForUpdatesMock.mockClear();

      advanceFakeTime(ENOUGH_TIME);

      expect(processCheckingForUpdatesMock).toHaveBeenCalled();
    });
  });

  describe("given updater is enabled but no configuration exist, when started", () => {
    beforeEach(async () => {
      builder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => true);
        mainDi.override(publishIsConfiguredInjectable, () => false);
      });

      await builder.render();
    });

    it("does not check for updates", () => {
      expect(processCheckingForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when time passes, never checks for updates", () => {
      jest.runOnlyPendingTimers();

      expect(processCheckingForUpdatesMock).not.toHaveBeenCalled();
    });
  });

  describe("given updater is not enabled but and configuration exist, when started", () => {
    beforeEach(async () => {
      builder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(electronUpdaterIsActiveInjectable, () => false);
        mainDi.override(publishIsConfiguredInjectable, () => true);
      });

      await builder.render();
    });

    it("does not check for updates", () => {
      expect(processCheckingForUpdatesMock).not.toHaveBeenCalled();
    });

    it("when time passes, never checks for updates", () => {
      jest.runOnlyPendingTimers();

      expect(processCheckingForUpdatesMock).not.toHaveBeenCalled();
    });
  });
});
