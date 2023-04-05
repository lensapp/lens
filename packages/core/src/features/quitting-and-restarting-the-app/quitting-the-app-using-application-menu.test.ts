/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import forceAppExitInjectable from "../../main/electron-app/features/force-app-exit.injectable";
import stopServicesAndExitAppInjectable from "../../main/stop-services-and-exit-app.injectable";
import { testUsingFakeTime, advanceFakeTime } from "../../test-utils/use-fake-time";

describe("quitting the app using application menu", () => {
  describe("given application has started", () => {
    let builder: ApplicationBuilder;
    let forceAppExitMock: jest.Mock;

    beforeEach(async () => {
      testUsingFakeTime("2015-10-21T07:28:00Z");

      builder = getApplicationBuilder();

      builder.beforeApplicationStart(({ mainDi }) => {
        mainDi.unoverride(stopServicesAndExitAppInjectable);

        forceAppExitMock = jest.fn();
        mainDi.override(forceAppExitInjectable, () => forceAppExitMock);
      });

      await builder.render();
    });

    it("first application window is open", () => {
      const windows = builder.applicationWindow.getAll();

      expect(windows.map((window) => window.id)).toEqual(["first-application-window"]);
    });

    describe("when application is quit", () => {
      beforeEach(() => {
        builder.applicationMenu.click("root", "mac", "quit");
      });

      it("closes all windows", () => {
        const windows = builder.applicationWindow.getAll();

        expect(windows).toEqual([]);
      });

      it("after insufficient time passes, does not terminate application yet", () => {
        advanceFakeTime(999);

        expect(forceAppExitMock).not.toHaveBeenCalled();
      });

      describe("after sufficient time passes", () => {
        beforeEach(() => {
          advanceFakeTime(1000);
        });

        it("terminates application", () => {
          expect(forceAppExitMock).toHaveBeenCalled();
        });
      });
    });
  });
});
