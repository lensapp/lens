/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { LensWindow } from "../../main/start-main-application/lens-window/application-window/create-lens-window.injectable";
import lensResourcesDirInjectable from "../../common/vars/lens-resources-dir.injectable";
import focusApplicationInjectable from "../../main/electron-app/features/focus-application.injectable";
import type { CreateElectronWindow } from "../../main/start-main-application/lens-window/application-window/create-electron-window.injectable";
import createElectronWindowInjectable from "../../main/start-main-application/lens-window/application-window/create-electron-window.injectable";
import splashWindowInjectable from "../../main/start-main-application/lens-window/splash-window/splash-window.injectable";

describe("opening application window using tray", () => {
  describe("given application has started", () => {
    let builder: ApplicationBuilder;
    let createElectronWindowMock: jest.Mock;
    let expectWindowsToBeOpen: (windowIds: string[]) => void;
    let callForSplashWindowHtmlMock: AsyncFnMock<() => Promise<void>>;
    let callForApplicationWindowHtmlMock: AsyncFnMock<() => Promise<void>>;
    let focusApplicationMock: jest.Mock;

    beforeEach(async () => {
      callForSplashWindowHtmlMock = asyncFn();
      callForApplicationWindowHtmlMock = asyncFn();

      focusApplicationMock = jest.fn();

      builder = getApplicationBuilder();

      builder.beforeApplicationStart((mainDi) => {
        mainDi.override(focusApplicationInjectable, () => focusApplicationMock);

        mainDi.override(
          lensResourcesDirInjectable,
          () => "some-lens-resources-directory",
        );

        const loadFileMock = jest
          .fn(callForSplashWindowHtmlMock)
          .mockImplementationOnce(() => Promise.resolve());

        const loadUrlMock = jest
          .fn(callForApplicationWindowHtmlMock)
          .mockImplementationOnce(() => Promise.resolve());

        createElectronWindowMock = jest.fn((toBeDecorated): CreateElectronWindow => (configuration) => {
          const browserWindow = toBeDecorated(configuration);

          if (configuration.id === "splash") {
            return { ...browserWindow, loadFile: loadFileMock };
          }

          if (configuration.id === "first-application-window") {
            return { ...browserWindow, loadUrl: loadUrlMock };
          }

          return browserWindow;
        });

        (mainDi as any).decorateFunction(
          createElectronWindowInjectable,
          createElectronWindowMock,
        );

        expectWindowsToBeOpen = expectWindowsToBeOpenFor(builder);
      });

      await builder.render();
    });

    it("only the first application window is open", () => {
      expectWindowsToBeOpen(["first-application-window"]);
    });

    describe("when an attempt to reopen the already started application is made using tray", () => {
      beforeEach(() => {
        builder.tray.click("open-app");
      });

      it("still shows only the application window", () => {
        expectWindowsToBeOpen(["first-application-window"]);
      });
    });

    describe("when the first application window is closed", () => {
      beforeEach(() => {
        const applicationWindow = builder.applicationWindow.only;

        applicationWindow.close();
      });

      it("no windows are open", () => {
        expectWindowsToBeOpen([]);
      });

      describe("when an application window is reopened using tray", () => {
        beforeEach(() => {
          focusApplicationMock.mockClear();

          callForSplashWindowHtmlMock.mockClear();
          callForApplicationWindowHtmlMock.mockClear();

          builder.tray.click("open-app");
        });

        it("focuses the application", () => {
          expect(focusApplicationMock).toHaveBeenCalled();
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

              builder.tray.click("open-app");
            });

            it("does not load contents of splash window again", () => {
              expect(callForSplashWindowHtmlMock).not.toHaveBeenCalled();
            });

            it("does not load contents of application window again", () => {
              expect(callForApplicationWindowHtmlMock).not.toHaveBeenCalled();
            });

            it("shows just the blank application window to permit developer tool access", () => {
              expectWindowsToBeOpen(["first-application-window"]);
            });
          });

          describe("when static HTML of application window resolves", () => {
            beforeEach(async () => {
              await callForApplicationWindowHtmlMock.resolve();
            });

            it("shows just the application window", () => {
              expectWindowsToBeOpen(["first-application-window"]);
            });

            describe("when reopening the application using tray", () => {
              beforeEach(() => {
                callForSplashWindowHtmlMock.mockClear();
                callForApplicationWindowHtmlMock.mockClear();

                builder.tray.click("open-app");
              });

              it("still shows just the application window", () => {
                expectWindowsToBeOpen(["first-application-window"]);
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

            builder.tray.click("open-app");
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

            expectWindowsToBeOpen(["first-application-window"]);
          });

          describe("given opening of application window has not finished yet, but another attempt to open the application is made", () => {
            beforeEach(() => {
              createElectronWindowMock.mockClear();

              builder.tray.click("open-app");
            });

            it("does not open any new windows", () => {
              expect(createElectronWindowMock).not.toHaveBeenCalled();
            });

            it("when opening finishes, only an application window is open", async () => {
              await callForApplicationWindowHtmlMock.resolve();

              expectWindowsToBeOpen(["first-application-window"]);
            });
          });
        });
      });
    });
  });
});

const expectWindowsToBeOpenFor =
  (builder: ApplicationBuilder) => (windowIds: string[]) => {
    const windows: LensWindow[] = [
      builder.mainDi.inject(splashWindowInjectable),
      ...builder.applicationWindow.getAll(),
    ];

    expect(
      windows.filter((window) => window.isVisible).map((window) => window.id),
    ).toEqual(windowIds);
  };
