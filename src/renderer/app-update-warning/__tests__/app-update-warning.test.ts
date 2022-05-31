/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import ipcRendererInjectable from "../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import sessionStorageInjectable from "../../utils/session-storage.injectable";
import type { AppUpdateWarning } from "../app-update-warning";
import appUpdateWarningInjectable from "../app-update-warning.injectable";

describe("app-update-warning", () => {
  let di: DiContainer;
  let appUpdateWarning: AppUpdateWarning;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(ipcRendererInjectable, () => ({
      on: (event: any, callback: () => void) => {
        if (event === "update-available") {
          callback();
        }
      }
    } as never));

    di.override(sessionStorageInjectable, () => ({
      setItem: jest.fn(),
      getItem: () => "2022-05-30T05:30:00.000Z",
      length: 0,
      key: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }) as never);

    appUpdateWarning = di.inject(appUpdateWarningInjectable);

    appUpdateWarning.init();
  });

  describe("given AppUpdateWarning with update date set", () => {
    it.skip("returns light warning level when update-downloaded event received", () => {
      expect(appUpdateWarning.warningLevel).toBe("light");
    });

    const lightDates = [
      ["2022-05-31T05:31:00.000Z"],
      ["2022-06-01T05:31:00.000Z"],
      ["2022-06-02T05:31:00.000Z"],
      ["2022-06-03T05:31:00.000Z"],
      ["2022-06-04T05:31:00.000Z"],
      ["2022-06-05T05:31:00.000Z"],
      ["2022-06-06T05:31:00.000Z"],
      ["2022-06-07T05:31:00.000Z"],
      ["2022-06-08T05:31:00.000Z"],
      ["2022-06-09T05:31:00.000Z"],
      ["2022-06-10T05:31:00.000Z"],
      ["2022-06-11T05:31:00.000Z"],
      ["2022-06-12T05:31:00.000Z"],
      ["2022-06-13T05:31:00.000Z"],
      ["2022-06-14T05:31:00.000Z"],
      ["2022-06-15T05:31:00.000Z"],
      ["2022-06-16T05:31:00.000Z"],
      ["2022-06-17T05:31:00.000Z"],
      ["2022-06-18T05:31:00.000Z"],
      ["2022-06-19T04:31:00.000Z"],
    ];

    const mediumDates = [
      ["2022-06-19T05:31:00.000Z"],
      ["2022-06-20T05:31:00.000Z"],
      ["2022-06-21T05:31:00.000Z"],
      ["2022-06-22T05:31:00.000Z"],
      ["2022-06-23T05:31:00.000Z"],
      ["2022-06-24T04:31:00.000Z"],
    ];

    const highDates = [
      ["2022-06-24T05:31:00.000Z"],
      ["2022-06-25T05:31:00.000Z"],
      ["2027-05-28T05:31:00.000Z"],
    ];

    describe.each(lightDates)("given AppUpdateWarning with update date set to %s", (date) => {
      beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date(date).getTime());
      });

      afterAll(() => {
        jest.useRealTimers();
      })

      it(`returns light warning level if date is ${date}`, () => {
        expect(appUpdateWarning.warningLevel).toBe("light");
      });
    });

    describe.each(mediumDates)("given AppUpdateWarning with update date set to %s", (date) => {
      beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date(date).getTime());
      });

      afterAll(() => {
        jest.useRealTimers();
      })

      it(`returns medium warning level if date is ${date}`, () => {
        expect(appUpdateWarning.warningLevel).toBe("medium");
      });
    });

    describe.each(highDates)("given AppUpdateWarning with update date set to %s", (date) => {
      beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date(date).getTime());
      });

      afterAll(() => {
        jest.useRealTimers();
      })

      it(`returns medium warning level if date is ${date}`, () => {
        expect(appUpdateWarning.warningLevel).toBe("high");
      });
    });
  });
});
