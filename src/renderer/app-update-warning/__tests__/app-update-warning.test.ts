/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import ipcRendererInjectable from "../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import appPublishDateInjectable from "../app-publish-date.injectable";
import appUpdateWarningInjectable from "../app-update-warning.injectable";

describe("app-update-warning", () => {
  const di = getDiForUnitTesting({ doGeneralOverrides: true });

  beforeEach(() => {
    di.override(ipcRendererInjectable, () => ({
      on: jest.fn(),
    } as never));

    di.override(appPublishDateInjectable, () => "2020-01-01T02:35:00");
  });

  describe("given AppUpdateWarning without release date and update date", () => {
    it("returns no warning level", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      expect(appUpdateWarning.warningLevel).toBe("");
    });
  });

  describe("given AppUpdateWarning with release date and various update dates", () => {
    it("returns no warning level if no update date passed", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      expect(appUpdateWarning.warningLevel).toBe("");
    });

    it("returns no warning level when days are equal", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      appUpdateWarning.downloadedUpdateDate = "2020-01-01T05:00:00";

      expect(appUpdateWarning.warningLevel).toBe("");
    });

    it("returns no warning level when update date is before release date", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      appUpdateWarning.downloadedUpdateDate = "2019-12-31T02:35:00";

      expect(appUpdateWarning.warningLevel).toBe("");
    });

    it("returns no warning level when update date is 10 days after release date", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      appUpdateWarning.downloadedUpdateDate = "2020-01-11T02:35:00";

      expect(appUpdateWarning.warningLevel).toBe("");
    });

    it("returns no warning level when update date is 19 days after release date", () => {
      const appUpdateWarning = di.inject(appUpdateWarningInjectable);

      appUpdateWarning.downloadedUpdateDate = "2020-01-20T02:35:00";

      expect(appUpdateWarning.warningLevel).toBe("");
    });

    describe("when downloaded update dates are in light warning level", () => {
      it.each([
        ["2020-01-21T02:35:01"],
        ["2020-01-22T00:00:00"],
        ["2020-01-23T00:00:00"],
        ["2020-01-24T00:00:00"],
        ["2020-01-25T00:00:00"],
        ["2020-01-26T00:00:00"],
        ["2020-01-26T02:34:00"],
      ])("returns light warning level when update date is %s", (updateDate) => {
        const appUpdateWarning = di.inject(appUpdateWarningInjectable);

        appUpdateWarning.downloadedUpdateDate = updateDate;

        expect(appUpdateWarning.warningLevel).toBe("light");
      });
    });

    describe("when downloaded update dates are in medium warning level", () => {
      it.each([
        ["2020-01-26T02:36:00"],
        ["2020-01-27T00:00:00"],
        ["2020-01-27T12:22:00"],
        ["2020-01-28T00:00:00"],
        ["2020-01-28T02:34:00"],
      ])("returns medium warning level when update date is %s", (updateDate) => {
        const appUpdateWarning = di.inject(appUpdateWarningInjectable);

        appUpdateWarning.downloadedUpdateDate = updateDate;

        expect(appUpdateWarning.warningLevel).toBe("medium");
      });
    });

    describe("when downloaded update dates are in high warning level", () => {
      it.each([
        ["2020-01-28T02:36:00"],
        ["2020-01-29T00:00:00"],
        ["2020-01-29T14:59:00"],
        ["2020-01-30T00:00:00"],
        ["2022-05-10T02:34:00"],
      ])("returns medium warning level when update date is %s", (updateDate) => {
        const appUpdateWarning = di.inject(appUpdateWarningInjectable);

        appUpdateWarning.downloadedUpdateDate = updateDate;

        expect(appUpdateWarning.warningLevel).toBe("high");
      });
    });
  });
});
