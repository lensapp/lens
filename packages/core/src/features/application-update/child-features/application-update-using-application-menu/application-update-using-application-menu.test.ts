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
import showMessagePopupInjectable from "../../../../main/electron-app/features/show-message-popup.injectable";
import type { ShowMessagePopup } from "../../../../main/electron-app/features/show-message-popup.injectable";
import electronUpdaterIsActiveInjectable
  from "../../../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable
  from "../../child-features/updating-is-enabled/main/publish-is-configured.injectable";

describe("installing update using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let showMessagePopupMock: AsyncFnMock<ShowMessagePopup>;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      checkForPlatformUpdatesMock = asyncFn();
      showMessagePopupMock = asyncFn();

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);

      mainDi.override(
        showMessagePopupInjectable,
        () => showMessagePopupMock,
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

        it("it displays a popup", () => {
          expect(showMessagePopupMock).toHaveBeenCalledWith(
            "No Updates Available",
            "You're all good",
            "You've got the latest version of Lens,\nthanks for staying on the ball.",
            { "textWidth": 300 },
          );
        });
      });
    });
  });
});
