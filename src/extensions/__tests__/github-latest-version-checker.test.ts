/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DownloadFileOptions } from "../../common/utils/downloadFile";
import { GitHubVersionChecker } from "../github-latest-version-checker";

const latestRelease = {
  tag_name: "v1.0.0",
  assets: [{
    browser_download_url: "https://foo.bar",
  }],
};

describe("GitHubVersionChecker", () => {
  describe("getLatestVersion", () => {
    it("returns null if homepage does not point to github", async () => {
      const checker = new GitHubVersionChecker();

      const version = await checker.getLatestVersion({
        name: "foo",
        version: "1.0.0",
      });

      expect(version).toBeNull();
    });

    it("fetches latest release from github", async () => {
      const downloadJson = (args: DownloadFileOptions) => {
        expect(args).toEqual({
          url: "https://api.github.com/repos/lens/extension/releases/latest",
          headers: {
            "user-agent": "Lens IDE",
          },
        });

        return { promise: new Promise((resolve) => {
          resolve(latestRelease);
        }) };
      };

      const checker = new GitHubVersionChecker(downloadJson);

      const version = await checker.getLatestVersion({
        name: "foo",
        version: "0.1.0",
        homepage: "https://github.com/lens/extension",
      });

      expect(version).toEqual({
        input: "https://foo.bar",
        version: "1.0.0",
      });
    });
  });
});
