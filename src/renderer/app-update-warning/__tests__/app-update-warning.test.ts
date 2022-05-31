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
  });

  describe("given AppUpdateWarning with update date set throught the event", () => {
    beforeEach(() => {
      appUpdateWarning = di.inject(appUpdateWarningInjectable);
      appUpdateWarning.init();
    });

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

  describe("given AppUpdateWarning with warning level changing over time", () => {
    let appUpdateWarning: AppUpdateWarning;

    beforeEach(() => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(new Date("2022-05-30T05:30:00.000Z").getTime());
      jest.spyOn(global, "setInterval");

      appUpdateWarning = di.inject(appUpdateWarningInjectable);
      appUpdateWarning.init();
    })
    
    afterEach(() => {
      jest.useRealTimers();
    });

    it("calls setInterval with correct arguments", () => {
      const onceADay = 1000 * 60 * 60 * 24;
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), onceADay);
    });

    it("shows light warning level if less than 20 days passed", () => {
      jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 5);
      expect(appUpdateWarning.warningLevel).toBe("light");
    });

    it("shows medium warning level if more than 20 days passed", () => {
      jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 21);
      expect(appUpdateWarning.warningLevel).toBe("medium");
    });

    it("shows high warning level if more than 2 days passed", () => {
      jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 30);
      expect(appUpdateWarning.warningLevel).toBe("high");
    });
  });
});
