/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
