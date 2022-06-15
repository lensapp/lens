/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { lensWindowInjectionToken } from "../../main/start-main-application/lens-window/application-window/lens-window-injection-token";
import applicationWindowInjectable from "../../main/start-main-application/lens-window/application-window/application-window.injectable";
import createElectronWindowForInjectable from "../../main/start-main-application/lens-window/application-window/create-electron-window.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { ElectronWindow, LensWindowConfiguration } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { flushPromises } from "../../common/test-utils/flush-promises";
import lensResourcesDirInjectable from "../../common/vars/lens-resources-dir.injectable";

describe("opening application window using tray", () => {
  describe("given application has started", () => {
    let applicationBuilder: ApplicationBuilder;
    let createElectronWindowMock: jest.Mock;
    let expectWindowsToBeOpen: (windowIds: string[]) => void;
    let callForSplashWindowHtmlMock: AsyncFnMock<() => void>;
    let callForApplicationWindowHtmlMock: AsyncFnMock<() => void>;

    beforeEach(async () => {
      applicationBuilder = getApplicationBuilder().beforeApplicationStart(
        ({ mainDi }) => {
          mainDi.override(lensResourcesDirInjectable, () => "some-lens-resources-directory");

          createElectronWindowMock = jest.fn((configuration: LensWindowConfiguration) =>
            ({
              splash: {
                send: () => {},
                close: () => {},
                show: () => {},
                loadFile: callForSplashWindowHtmlMock,
                loadUrl: () => { throw new Error("Should never come here"); },
              },

              "only-application-window": {
                send: () => {},
                close: () => {},
                show: () => {},
                loadFile: () => { throw new Error("Should never come here"); },
                loadUrl: callForApplicationWindowHtmlMock,
              },
            }[configuration.id] as ElectronWindow));

          mainDi.override(
            createElectronWindowForInjectable,

            () => createElectronWindowMock,
          );

          expectWindowsToBeOpen = expectWindowsToBeOpenFor(mainDi);

          callForSplashWindowHtmlMock = asyncFn();
          callForApplicationWindowHtmlMock = asyncFn();
        },
      );

      const renderPromise = applicationBuilder.render();

      await flushPromises();

      await callForSplashWindowHtmlMock.resolve();
      await callForApplicationWindowHtmlMock.resolve();

      await renderPromise;
    });

    it("only an application window is open", () => {
      expectWindowsToBeOpen(["only-application-window"]);
    });

    describe("when an attempt to reopen the already started application is made using tray", () => {
      beforeEach(() => {
        applicationBuilder.tray.click("open-app");
      });

      it("still shows only the application window", () => {
        expectWindowsToBeOpen(["only-application-window"]);
      });
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
          callForSplashWindowHtmlMock.mockClear();
          callForApplicationWindowHtmlMock.mockClear();

          applicationBuilder.tray.click("open-app");
        });

        it("still no windows are open", () => {
          expectWindowsToBeOpen([]);
        });

        it("starts loading static HTML of splash window", () => {
          expect(callForSplashWindowHtmlMock).toHaveBeenCalledWith("/some-absolute-root-directory/some-lens-resources-directory/static/splash.html");
        });

        describe("when loading of splash window HTML resolves", () => {
          beforeEach(async () => {
            await callForSplashWindowHtmlMock.resolve();
          });

          it("shows just the splash window", () => {
            expectWindowsToBeOpen(["splash"]);
          });

          it("starts loading of content for the application window", () => {
            expect(callForApplicationWindowHtmlMock).toHaveBeenCalledWith("http://localhost:42");
          });

          describe("given static HTML of application window has not resolved yet, when opening from tray again", () => {
            beforeEach(() => {
              callForApplicationWindowHtmlMock.mockClear();
              callForSplashWindowHtmlMock.mockClear();

              applicationBuilder.tray.click("open-app");
            });

            it("does not load contents of splash window again", () => {
              expect(callForSplashWindowHtmlMock).not.toHaveBeenCalled();
            });

            it("does not load contents of application window again", () => {
              expect(callForApplicationWindowHtmlMock).not.toHaveBeenCalled();
            });

            it("shows just the blank application window to permit developer tool access", () => {
              expectWindowsToBeOpen(["only-application-window"]);
            });
          });

          describe("when static HTML of application window resolves", () => {
            beforeEach(async () => {
              await callForApplicationWindowHtmlMock.resolve();
            });

            it("shows just the application window", () => {
              expectWindowsToBeOpen(["only-application-window"]);
            });

            describe("when reopening the application using tray", () => {
              beforeEach(() => {
                callForSplashWindowHtmlMock.mockClear();
                callForApplicationWindowHtmlMock.mockClear();

                applicationBuilder.tray.click("open-app");
              });

              it("still shows just the application window", () => {
                expectWindowsToBeOpen(["only-application-window"]);
              });

              it("does not load HTML for splash window again", () => {
                expect(callForSplashWindowHtmlMock).not.toHaveBeenCalled();
              });

              it("does not load HTML for application window again", () => {
                expect(callForApplicationWindowHtmlMock).not.toHaveBeenCalled();
              });
            });
          });
        });

        describe("given opening of splash window has not finished yet, but another attempt to open the application is made", () => {
          beforeEach(() => {
            createElectronWindowMock.mockClear();

            applicationBuilder.tray.click("open-app");
          });

          it("does not open any new windows", () => {
            expect(createElectronWindowMock).not.toHaveBeenCalled();
          });
        });

        describe("when opening of splash window resolves", () => {
          beforeEach(async () => {
            await callForSplashWindowHtmlMock.resolve();
          });

          it("still only splash window is open", () => {
            expectWindowsToBeOpen(["splash"]);
          });

          it("when opening of application window finishes, only an application window is open", async () => {
            await callForApplicationWindowHtmlMock.resolve();

            expectWindowsToBeOpen(["only-application-window"]);
          });

          describe("given opening of application window has not finished yet, but another attempt to open the application is made", () => {
            beforeEach(() => {
              createElectronWindowMock.mockClear();

              applicationBuilder.tray.click("open-app");
            });

            it("does not open any new windows", () => {
              expect(createElectronWindowMock).not.toHaveBeenCalled();
            });

            it("when opening finishes, only an application window is open", async () => {
              await callForApplicationWindowHtmlMock.resolve();

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
    windows.filter((window) => window.isVisible).map((window) => window.id),
  ).toEqual(windowIds);
};
