/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { ClusterManager } from "../../main/cluster-manager";
import exitAppInjectable from "../../main/electron-app/features/exit-app.injectable";
import clusterManagerInjectable from "../../main/cluster-manager.injectable";
import stopServicesAndExitAppInjectable from "../../main/stop-services-and-exit-app.injectable";
import { advanceFakeTime, useFakeTime } from "../../common/test-utils/use-fake-time";

describe("quitting the app using application menu", () => {
  describe("given application has started", () => {
    let builder: ApplicationBuilder;
    let clusterManagerStub: ClusterManager;
    let exitAppMock: jest.Mock;

    beforeEach(async () => {
      useFakeTime("2015-10-21T07:28:00Z");

      builder = getApplicationBuilder();

      builder.beforeApplicationStart(
        (mainDi) => {
          mainDi.unoverride(stopServicesAndExitAppInjectable);

          clusterManagerStub = { stop: jest.fn() } as unknown as ClusterManager;
          mainDi.override(clusterManagerInjectable, () => clusterManagerStub);

          exitAppMock = jest.fn();
          mainDi.override(exitAppInjectable, () => exitAppMock);
        },
      );

      await builder.render();
    });

    it("first application window is open", () => {
      const windows = builder.applicationWindow.getAll();

      expect(windows.map((window) => window.id)).toEqual(["first-application-window"]);
    });

    describe("when application is quit", () => {
      beforeEach(() => {
        builder.applicationMenu.click("root.quit");
      });

      it("closes all windows", () => {
        const windows = builder.applicationWindow.getAll();

        expect(windows).toEqual([]);
      });

      it("disconnects all clusters", () => {
        expect(clusterManagerStub.stop).toHaveBeenCalled();
      });

      it("after insufficient time passes, does not terminate application yet", () => {
        advanceFakeTime(999);

        expect(exitAppMock).not.toHaveBeenCalled();
      });

      describe("after sufficient time passes", () => {
        beforeEach(() => {
          advanceFakeTime(1000);
        });

        it("terminates application", () => {
          expect(exitAppMock).toHaveBeenCalled();
        });
      });
    });
  });
});
