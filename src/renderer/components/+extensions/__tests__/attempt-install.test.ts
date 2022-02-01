/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import removeDirInjectable from "../../../../common/fs/remove-dir.injectable";
import getInstalledExtensionInjectable from "../../../../extensions/extension-loader/get-installed-extension.injectable";
import { InstallationState } from "../../../../extensions/installation-state/state";
import { getDisForUnitTesting } from "../../../../test-utils/get-dis-for-unit-testing";
import getInstallationStateInjectable from "../../../extensions/installation-state/get-installation-state.injectable";
import { noop } from "../../../utils";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";
import createTempFilesAndValidateInjectable from "../attempt-install/create-temp-files-and-validate/create-temp-files-and-validate.injectable";
import unpackExtensionInjectable from "../attempt-install/unpack-extension/unpack-extension.injectable";

describe("attemptInstall()", () => {
  let rendererDi: ConfigurableDependencyInjectionContainer;

  beforeEach(async () => {
    const dis = await getDisForUnitTesting({ doGeneralOverrides: true });

    rendererDi = dis.rendererDi;

    await dis.runSetups();
  });

  it("should attempt to remove any broken remnants of a previous install", async () => {
    const removeDir = jest.fn();

    rendererDi.override(createTempFilesAndValidateInjectable, () => ({ fileName }) => Promise.resolve({
      fileName,
      data: Buffer.from([]),
      id: "some-extension-id",
      manifest: {
        name: "some-extension-name",
        version: "1.0.0",
      },
      tempFile: "/some-fole-path",
    }));
    rendererDi.override(getInstallationStateInjectable, () => () => InstallationState.IDLE);
    rendererDi.override(getInstalledExtensionInjectable, () => () => undefined);
    rendererDi.override(unpackExtensionInjectable, () => () => Promise.resolve());
    rendererDi.override(removeDirInjectable, () => removeDir);

    const attemptInstall = rendererDi.inject(attemptInstallInjectable);

    await attemptInstall({ fileName: "foobar", dataP: Promise.resolve(Buffer.from([])) }, noop);
    expect(removeDir).toBeCalledTimes(1);
  });
});
