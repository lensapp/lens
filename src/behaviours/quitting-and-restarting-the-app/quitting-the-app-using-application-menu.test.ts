/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { ClusterManager } from "../../main/cluster-manager";
import { lensWindowInjectionToken } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import exitAppInjectable from "../../main/electron-app/features/exit-app.injectable";
import clusterManagerInjectable from "../../main/cluster-manager.injectable";
import stopServicesAndExitAppInjectable from "../../main/stop-services-and-exit-app.injectable";

describe("quitting the app using application menu", () => {
  describe("given application has started", () => {
    let applicationBuilder: ApplicationBuilder;
    let clusterManagerStub: ClusterManager;
    let exitAppMock: jest.Mock;

    beforeEach(async () => {
      jest.useFakeTimers();

      applicationBuilder = getApplicationBuilder().beforeApplicationStart(
        ({ mainDi }) => {
          mainDi.unoverride(stopServicesAndExitAppInjectable);

          clusterManagerStub = { stop: jest.fn() } as unknown as ClusterManager;
          mainDi.override(clusterManagerInjectable, () => clusterManagerStub);

          exitAppMock = jest.fn();
          mainDi.override(exitAppInjectable, () => exitAppMock);
        },
      );

      await applicationBuilder.render();
    });

    it("only an application window is open", () => {
      const windows = applicationBuilder.dis.mainDi.injectMany(
        lensWindowInjectionToken,
      );

      expect(
        windows.map((window) => ({ id: window.id, visible: window.visible })),
      ).toEqual([
        { id: "only-application-window", visible: true },
        { id: "splash", visible: false },
      ]);
    });

    describe("when application is quit", () => {
      beforeEach(async () => {
        await applicationBuilder.applicationMenu.click("root.quit");
      });

      it("closes all windows", () => {
        const windows = applicationBuilder.dis.mainDi.injectMany(
          lensWindowInjectionToken,
        );

        expect(
          windows.map((window) => ({ id: window.id, visible: window.visible })),
        ).toEqual([
          { id: "only-application-window", visible: false },
          { id: "splash", visible: false },
        ]);
      });

      it("disconnects all clusters", () => {
        expect(clusterManagerStub.stop).toHaveBeenCalled();
      });

      it("after insufficient time passes, does not terminate application yet", () => {
        jest.advanceTimersByTime(999);

        expect(exitAppMock).not.toHaveBeenCalled();
      });

      describe("after sufficient time passes", () => {
        beforeEach(() => {
          jest.advanceTimersByTime(1000);
        });

        it("terminates application", () => {
          expect(exitAppMock).toHaveBeenCalled();
        });
      });
    });
  });
});
