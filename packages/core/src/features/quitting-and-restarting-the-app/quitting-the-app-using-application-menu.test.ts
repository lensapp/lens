/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { testUsingFakeTime } from "../../test-utils/use-fake-time";
import requestQuitOfAppInjectable from "../../main/electron-app/features/require-quit.injectable";

describe("quitting the app using application menu", () => {
  describe("given application has started", () => {
    let builder: ApplicationBuilder;
    let requestQuitOfAppMock: jest.Mock;

    beforeEach(async () => {
      testUsingFakeTime("2015-10-21T07:28:00Z");

      builder = getApplicationBuilder();

      builder.beforeApplicationStart(({ mainDi }) => {
        requestQuitOfAppMock = jest.fn();
        mainDi.override(requestQuitOfAppInjectable, () => requestQuitOfAppMock);
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

      it("requests quit of application", () => {
        expect(requestQuitOfAppMock).toBeCalled();
      });
    });
  });
});
