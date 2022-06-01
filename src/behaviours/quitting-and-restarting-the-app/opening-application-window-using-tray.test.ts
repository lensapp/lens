/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { lensWindowInjectionToken } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import applicationWindowInjectable from "../../main/start-main-application/lens-window/application-window/application-window.injectable";
import createElectronWindowForInjectable from "../../main/start-main-application/lens-window/application-window/create-electron-window-for.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";

import type {
  ElectronWindow,
  LensWindowConfiguration,
} from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";

import { flushPromises } from "../../common/test-utils/flush-promises";
import type { DiContainer } from "@ogre-tools/injectable";

describe("opening application window using tray", () => {
  describe("given application has started", () => {
    let applicationBuilder: ApplicationBuilder;

    let createElectronWindowMock: AsyncFnMock<
      (configuration: LensWindowConfiguration) => ElectronWindow
    >;

    let expectWindowsToBeOpen: (windowIds: string[]) => void;
    let resolveOpeningOfWindow: (windowId: string) => Promise<void>;

    beforeEach(async () => {
      applicationBuilder = getApplicationBuilder().beforeApplicationStart(
        ({ mainDi }) => {
          createElectronWindowMock = asyncFn();

          mainDi.override(
            createElectronWindowForInjectable,

            () => (configuration) => () =>
              createElectronWindowMock(configuration),
          );

          expectWindowsToBeOpen = expectWindowsToBeOpenFor(mainDi);

          resolveOpeningOfWindow = resolveOpeningOfWindowFor(
            createElectronWindowMock,
          );
        },
      );

      const renderPromise = applicationBuilder.render();

      await flushPromises();

      await resolveOpeningOfWindow("splash");
      await resolveOpeningOfWindow("only-application-window");

      await renderPromise;
    });

    it("only an application window is open", () => {
      expectWindowsToBeOpen(["only-application-window"]);
    });

    describe("when the application window is closed", () => {
      beforeEach(() => {
        const applicationWindow = applicationBuilder.dis.mainDi.inject(
          applicationWindowInjectable,
        );

        applicationWindow.close();
      });

      it("no windows are open", () => {
        expectWindowsToBeOpen([]);
      });

      describe("when an application window is reopened using tray", () => {
        beforeEach(() => {
          applicationBuilder.tray.click("open-app");
        });

        it("still no windows are open", () => {
          expectWindowsToBeOpen([]);
        });

        describe("when opening of splash window resolves", () => {
          beforeEach(async () => {
            await resolveOpeningOfWindow("splash");
          });

          it("still only splash window is open", () => {
            expectWindowsToBeOpen(["splash"]);
          });

          it("when opening finishes, only an application window is open", async () => {
            await resolveOpeningOfWindow("only-application-window");

            expectWindowsToBeOpen(["only-application-window"]);
          });

          describe("given opening has not finished yet, but another attempt to open the application is made", () => {
            beforeEach(() => {
              createElectronWindowMock.mockClear();

              applicationBuilder.tray.click("open-app");
            });

            it("does not open any new windows", () => {
              expect(createElectronWindowMock).not.toHaveBeenCalled();
            });

            it("when opening finishes, only an application window is open", async () => {
              await resolveOpeningOfWindow("only-application-window");

              expectWindowsToBeOpen(["only-application-window"]);
            });
          });
        });
      });
    });
  });
});

const expectWindowsToBeOpenFor = (di: DiContainer) => (windowIds: string[]) => {
  const windows = di.injectMany(lensWindowInjectionToken);

  expect(
    windows.filter((window) => window.visible).map((window) => window.id),
  ).toEqual(windowIds);
};

const resolveOpeningOfWindowFor =
  (
    createElectronWindowMock: AsyncFnMock<
      (configuration: LensWindowConfiguration) => ElectronWindow
    >,
  ) =>
    async (windowId: string) => {
      await createElectronWindowMock.resolveSpecific(
        [{ id: windowId }],

        {
          send: () => {},
          close: () => {},
          show: () => {},
        },
      );
    };
