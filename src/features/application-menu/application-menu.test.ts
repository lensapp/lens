/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import populateApplicationMenuInjectable from "./main/populate-application-menu.injectable";
import { advanceFakeTime, useFakeTime } from "../../common/test-utils/use-fake-time";
import { getCompositePaths } from "../../common/utils/composite/get-composite-paths/get-composite-paths";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import isLinuxInjectable from "../../common/vars/is-linux.injectable";

describe.each(["win", "mac", "linux"])("application-menu, given environment is '%s'", (environment) => {
  let builder: ApplicationBuilder;
  let populateApplicationMenuMock: jest.Mock;

  beforeEach(async () => {
    useFakeTime();

    populateApplicationMenuMock = jest.fn();

    builder = getApplicationBuilder();

    builder.beforeApplicationStart((mainDi) => {
      switch (environment) {
        case "mac":
          mainDi.override(isMacInjectable, () => true);
          mainDi.override(isWindowsInjectable, () => false);
          mainDi.override(isLinuxInjectable, () => false);
          break;

        case "win":
          mainDi.override(isMacInjectable, () => false);
          mainDi.override(isWindowsInjectable, () => true);
          mainDi.override(isLinuxInjectable, () => false);
          break;

        case "linux":
          mainDi.override(isMacInjectable, () => false);
          mainDi.override(isWindowsInjectable, () => false);
          mainDi.override(isLinuxInjectable, () => true);
          break;
      }

      mainDi.override(
        populateApplicationMenuInjectable,
        () => populateApplicationMenuMock,
      );
    });

    await builder.startHidden();
  });

  it("when insufficient time passes, does not populate menu items yet", () => {
    advanceFakeTime(99);

    expect(populateApplicationMenuMock).not.toHaveBeenCalled();
  });

  describe("given enough time passes", () => {
    let applicationMenuPaths: string[][];

    beforeEach(() => {
      advanceFakeTime(100);
      applicationMenuPaths = getCompositePaths(
        populateApplicationMenuMock.mock.calls[0][0],
      );
    });

    it("populates application menu with at least something", () => {
      expect(applicationMenuPaths.length).toBeGreaterThan(0);
    });

    it("populates application menu", () => {
      expect(applicationMenuPaths.map(x => x.join(" -> "))).toMatchSnapshot();
    });
  });
});
