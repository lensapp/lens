/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DownloadFileOptions } from "../../common/utils/downloadFile";
import { NpmJsVersionChecker } from "../npmjs-latest-version.checker";

const npmPackage = {
  versions: {
    "1.0.0": {
      name: "foo",
    },
  },
};

describe("NpmJsVersionChecker", () => {
  describe("getLatestVersion", () => {

    it("returns null if versions not present", async () => {
      const downloadJson = () => {
        return { promise: new Promise((resolve) => {
          resolve({});
        }) };
      };

      const checker = new NpmJsVersionChecker(downloadJson);


      const version = await checker.getLatestVersion({
        name: "foo",
        version: "0.1.0",
      });

      expect(version).toBeNull();
    });

    it("fetches latest release from npmjs", async () => {
      const downloadJson = (args: DownloadFileOptions) => {
        expect(args).toEqual({
          url: "https://registry.npmjs.com/foo",
        });

        return { promise: new Promise((resolve) => {
          resolve(npmPackage);
        }) };
      };

      const checker = new NpmJsVersionChecker(downloadJson);

      const version = await checker.getLatestVersion({
        name: "foo",
        version: "0.1.0",
      });

      expect(version).toEqual({
        input: "foo",
        version: "1.0.0",
      });
    });
  });
});
