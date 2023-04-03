/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import type { CheckForPlatformUpdates } from "../../main/check-for-updates/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../../main/check-for-updates/check-for-platform-updates/check-for-platform-updates.injectable";
import type { RenderResult } from "@testing-library/react";

describe("installing update using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      checkForPlatformUpdatesMock = asyncFn();
      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );
    });
  });

  describe("when started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when user checks for updates using application menu", () => {
      beforeEach(() => {
        applicationBuilder.applicationMenu.click(
          "root",
          "mac",
          "check-for-updates",
        );
      });
      describe("when no new update is discovered", () => {
        beforeEach(async () => {
          await checkForPlatformUpdatesMock.resolve({
            updateWasDiscovered: false,
          });
        });

        // it displays a popup
        // showMessagePopup(
        //   "No Updates Available",
        //   "You're all good",
        //   "You've got the latest version of Lens,\nthanks for staying on the ball.",
        //   {
        //       textWidth: 300,
        //   },
        // );
      });
    });
  });
});
