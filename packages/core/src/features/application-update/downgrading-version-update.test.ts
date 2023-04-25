/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import electronUpdaterIsActiveInjectable from "../../main/electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "./child-features/updating-is-enabled/main/publish-is-configured.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { CheckForPlatformUpdates } from "./main/check-for-updates/check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "./main/check-for-updates/check-for-platform-updates/check-for-platform-updates.injectable";
import processCheckingForUpdatesInjectable from "./main/process-checking-for-updates.injectable";
import selectedUpdateChannelInjectable from "./common/selected-update-channel.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { updateChannels } from "./common/update-channels";
import getBuildVersionInjectable from "../../main/electron-app/features/get-build-version.injectable";

describe("downgrading version update", () => {
  let applicationBuilder: ApplicationBuilder;
  let checkForPlatformUpdatesMock: AsyncFnMock<CheckForPlatformUpdates>;
  let mainDi: DiContainer;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
      checkForPlatformUpdatesMock = asyncFn();

      mainDi.override(
        checkForPlatformUpdatesInjectable,
        () => checkForPlatformUpdatesMock,
      );

      mainDi.override(electronUpdaterIsActiveInjectable, () => true);
      mainDi.override(publishIsConfiguredInjectable, () => true);
    });

    mainDi = applicationBuilder.mainDi;
  });

  [
    {
      updateChannel: updateChannels.latest,
      appVersion: "4.0.0",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.beta,
      appVersion: "4.0.0",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.alpha,
      appVersion: "4.0.0",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.latest,
      appVersion: "4.0.0-latest",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.beta,
      appVersion: "4.0.0-latest",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.alpha,
      appVersion: "4.0.0-latest",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.latest,
      appVersion: "4.0.0-beta",
      downgradeIsAllowed: true,
    },
    {
      updateChannel: updateChannels.beta,
      appVersion: "4.0.0-beta",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.alpha,
      appVersion: "4.0.0-beta",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.latest,
      appVersion: "4.0.0-alpha",
      downgradeIsAllowed: true,
    },
    {
      updateChannel: updateChannels.beta,
      appVersion: "4.0.0-alpha",
      downgradeIsAllowed: false,
    },
    {
      updateChannel: updateChannels.alpha,
      appVersion: "4.0.0-alpha",
      downgradeIsAllowed: false,
    },
  ].forEach(({ appVersion, updateChannel, downgradeIsAllowed }) => {
    it(`given application version "${appVersion}" and update channel "${updateChannel.id}", when checking for updates, can${downgradeIsAllowed ? "": "not"} downgrade`, async () => {
      mainDi.override(getBuildVersionInjectable, () => () => appVersion);

      await applicationBuilder.render();

      const selectedUpdateChannel = mainDi.inject(selectedUpdateChannelInjectable);

      selectedUpdateChannel.setValue(updateChannel.id);

      const processCheckingForUpdates = mainDi.inject(processCheckingForUpdatesInjectable);

      processCheckingForUpdates("irrelevant");

      expect(checkForPlatformUpdatesMock).toHaveBeenCalledWith(expect.any(Object), { allowDowngrade: downgradeIsAllowed });
    });
  });
});
