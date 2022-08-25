/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { downloadFile, downloadJson } from "../../../common/utils";
import { Notifications } from "../notifications";
import React from "react";
import { SemVer } from "semver";
import URLParse from "url-parse";
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import getBaseRegistryUrlInjectable from "./get-base-registry-url/get-base-registry-url.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import confirmInjectable from "../confirm-dialog/confirm.injectable";
import { reduce } from "lodash";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";

export interface ExtensionInfo {
  name: string;
  version?: string;
  requireConfirmation?: boolean;
}

export type AttemptInstallByInfo = (info: ExtensionInfo) => Promise<void>;

const attemptInstallByInfoInjectable = getInjectable({
  id: "attempt-install-by-info",
  instantiate: (di): AttemptInstallByInfo => {
    const attemptInstall = di.inject(attemptInstallInjectable);
    const getBaseRegistryUrl = di.inject(getBaseRegistryUrlInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const confirm = di.inject(confirmInjectable);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);

    return async (info) => {
      const { name, version, requireConfirmation = false } = info;
      const disposer = extensionInstallationStateStore.startPreInstall();
      const baseUrl = await getBaseRegistryUrl();
      const registryUrl = new URLParse(baseUrl).set("pathname", name).toString();
      let json: any;
      let finalVersion = version;

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
            finalVersion = json["dist-tags"][version];
          } else {
            Notifications.error((
              <p>
                {"The "}
                <em>{name}</em>
                {" extension does not have a version or tag "}
                <code>{version}</code>
                .
              </p>
            ));

            return disposer();
          }
        }
      } else {
        const versions = Object.keys(json.versions)
          .map(version => new SemVer(version, { loose: true }))
        // ignore pre-releases for auto picking the version
          .filter(version => version.prerelease.length === 0);

        const latestVersion = reduce(versions, (prev, curr) => prev.compareMain(curr) === -1 ? curr : prev);

        if (!latestVersion) {
          console.error("No versions supplied for that extension", { name });
          Notifications.error(`No versions found for ${name}`);

          return disposer();
        }

        finalVersion = latestVersion.format();
      }

      if (requireConfirmation) {
        const proceed = await confirm({
          message: (
            <p>
              Are you sure you want to install
              {" "}
              <b>
                {name}
                @
                {finalVersion}
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const url = json.versions[finalVersion!].dist.tarball;
      const fileName = getBasenameOfPath(url);
      const { promise: dataP } = downloadFile({ url, timeout: 10 * 60 * 1000 });

      return attemptInstall({ fileName, dataP }, disposer);
    };
  },
});

export default attemptInstallByInfoInjectable;
