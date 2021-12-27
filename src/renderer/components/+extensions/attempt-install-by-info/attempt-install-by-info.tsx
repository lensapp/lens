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
import { ExtensionInstallationStateStore } from "../extension-install.store";
import { downloadFile, downloadJson, ExtendableDisposer } from "../../../../common/utils";
import { Notifications } from "../../notifications";
import { ConfirmDialog } from "../../confirm-dialog";
import React from "react";
import path from "path";
import { SemVer } from "semver";
import URLParse from "url-parse";
import type { InstallRequest } from "../attempt-install/install-request";
import lodash from "lodash";

export interface ExtensionInfo {
  name: string;
  version?: string;
  requireConfirmation?: boolean;
}

interface Dependencies {
  attemptInstall: (request: InstallRequest, d: ExtendableDisposer) => Promise<void>;
  getBaseRegistryUrl: () => Promise<string>;
}

export const attemptInstallByInfo = ({ attemptInstall, getBaseRegistryUrl }: Dependencies) => async ({
  name,
  version,
  requireConfirmation = false,
}: ExtensionInfo) => {
  const disposer = ExtensionInstallationStateStore.startPreInstall();
  const baseUrl = await getBaseRegistryUrl();
  const registryUrl = new URLParse(baseUrl).set("pathname", name).toString();
  let json: any;

  try {
    json = await downloadJson({ url: registryUrl }).promise;

    if (!json || json.error || typeof json.versions !== "object" || !json.versions) {
      const message = json?.error ? `: ${json.error}` : "";

      Notifications.error(`Failed to get registry information for that extension${message}`);

      return disposer();
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      // assume invalid JSON
      console.warn("Set registry has invalid json", { url: baseUrl }, error);
      Notifications.error("Failed to get valid registry information for that extension. Registry did not return valid JSON");
    } else {
      console.error("Failed to download registry information", error);
      Notifications.error(`Failed to get valid registry information for that extension. ${error}`);
    }

    return disposer();
  }

  if (version) {
    if (!json.versions[version]) {
      if (json["dist-tags"][version]) {
        version = json["dist-tags"][version];
      } else {
        Notifications.error(
          <p>
            The <em>{name}</em> extension does not have a version or tag{" "}
            <code>{version}</code>.
          </p>,
        );

        return disposer();
      }
    }
  } else {
    const versions = Object.keys(json.versions)
      .map(
        version =>
          new SemVer(version, { loose: true, includePrerelease: true }),
      )
      // ignore pre-releases for auto picking the version
      .filter(version => version.prerelease.length === 0);

    version = lodash.reduce(versions, (prev, curr) =>
      prev.compareMain(curr) === -1 ? curr : prev,
    ).format();
  }

  if (requireConfirmation) {
    const proceed = await ConfirmDialog.confirm({
      message: (
        <p>
          Are you sure you want to install{" "}
          <b>
            {name}@{version}
          </b>
          ?
        </p>
      ),
      labelCancel: "Cancel",
      labelOk: "Install",
    });

    if (!proceed) {
      return disposer();
    }
  }

  const url = json.versions[version].dist.tarball;
  const fileName = path.basename(url);
  const { promise: dataP } = downloadFile({ url, timeout: 10 * 60 * 1000 });

  return attemptInstall({ fileName, dataP }, disposer);
};
