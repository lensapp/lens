/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import electronAppInjectable from "./electron-app/electron-app.injectable";
import getElectronAppPathInjectable from "./get-electron-app-path.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { App } from "electron";
import registerChannelInjectable from "../register-channel/register-channel.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import { joinPathsFake } from "../../../common/test-utils/join-paths-fake";

describe("get-electron-app-path", () => {
  let getElectronAppPath: (name: string) => string;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: false });

    const appStub = {
      name: "some-app-name",

      getPath: (name: string) => {
        if (name !== "some-existing-name") {
          throw new Error("irrelevant");
        }

        return "some-existing-app-path";
      },

      // eslint-disable-next-line unused-imports/no-unused-vars-ts
      setPath: (_, __) => undefined,
    } as App;

    di.override(electronAppInjectable, () => appStub);
    di.override(registerChannelInjectable, () => () => undefined);
    di.override(joinPathsInjectable, () => joinPathsFake);

    await di.runSetups();

    getElectronAppPath = di.inject(getElectronAppPathInjectable) as (name: string) => string;
  });

  it("given app path exists, when called, returns app path", () => {
    const actual = getElectronAppPath("some-existing-name");

    expect(actual).toBe("some-existing-app-path");
  });

  it("given app path does not exist, when called, returns null", () => {
    const actual = getElectronAppPath("some-non-existing-name");

    expect(actual).toBe("");
  });
});
