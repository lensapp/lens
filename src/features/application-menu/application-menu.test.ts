/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import populateApplicationMenuInjectable from "./main/populate-application-menu.injectable";
import { advanceFakeTime, useFakeTime } from "../../common/test-utils/use-fake-time";

describe("application-menu", () => {
  let builder: ApplicationBuilder;
  let mainDi: DiContainer;
  let populateApplicationMenuMock: jest.Mock;

  beforeEach(async () => {
    useFakeTime();

    populateApplicationMenuMock = jest.fn();

    builder = getApplicationBuilder();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(populateApplicationMenuInjectable, () => populateApplicationMenuMock);
    });

    // await builder.render();
    await builder.startHidden();

    mainDi = builder.mainDi;
  });

  it("when insufficient time passes, does not populate menu items yet", () => {
    advanceFakeTime(99);

    expect(populateApplicationMenuMock).not.toHaveBeenCalled();
  });

  describe("given enough time passes", () => {
    beforeEach(() => {
      advanceFakeTime(100);
    });

    it("populates application menu", () => {
      expect(populateApplicationMenuMock).toHaveBeenCalledWith(expect.any(Array));
    });

    it("populates application menu lol", () => {
      expect(populateApplicationMenuMock.mock.calls).toMatchSnapshot();
    });
  });
});
