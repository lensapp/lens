/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import type { GetPathToLegacyPackageJson } from "./get-path-to-legacy-package-json.injectable";
import getPathToLegacyPackageJsonInjectable from "./get-path-to-legacy-package-json.injectable";

describe("get-legacy-path-for-extension-name", () => {
  let getPathToLegacyPackageJson: GetPathToLegacyPackageJson;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });
    const directoryForExtensionDataMock = jest.fn().mockReturnValue("/path/to/user/data");

    di.override(directoryForUserDataInjectable, directoryForExtensionDataMock);
    getPathToLegacyPackageJson = di.inject(getPathToLegacyPackageJsonInjectable);
  });

  describe("given extension name", () => {
    it("given some extension returns path for package.json in user data directory", () => {
      const pathToExtensionPackageJson = getPathToLegacyPackageJson("some-extension");

      expect(pathToExtensionPackageJson).toEqual("/path/to/user/data/node_modules/some-extension/package.json");
    });

    it("given some other extension returns path for package.json in user data directory", () => {
      const pathToExtensionPackageJson = getPathToLegacyPackageJson("some-other-extension");

      expect(pathToExtensionPackageJson).toEqual("/path/to/user/data/node_modules/some-other-extension/package.json");
    });
  });
});
