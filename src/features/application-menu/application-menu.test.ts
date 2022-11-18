/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../test-utils/application-builder";
import { setupInitializingApplicationBuilder } from "../test-utils/application-builder";
import populateApplicationMenuInjectable from "./main/populate-application-menu.injectable";
import { advanceFakeTime, testUsingFakeTime } from "../../common/test-utils/use-fake-time";
import { getCompositePaths } from "../../common/utils/composite/get-composite-paths/get-composite-paths";
import platformInjectable, { allPlatforms } from "../../common/vars/platform.injectable";

describe.each(allPlatforms)("application-menu, given platform is '%s'", (platform) => {
  let builder: ApplicationBuilder;
  let populateApplicationMenuMock: jest.Mock;

  setupInitializingApplicationBuilder(b => builder = b);

  beforeEach(async () => {
    testUsingFakeTime();

    populateApplicationMenuMock = jest.fn();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(platformInjectable, () => platform);

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
