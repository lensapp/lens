/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isObject } from "@k8slens/utilities";
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
import { withTimeout } from "../../../common/fetch/timeout-controller";
import downloadBinaryInjectable from "../../../common/fetch/download-binary.injectable";
import downloadJsonInjectable from "../../../common/fetch/download-json/normal.injectable";
import type { PackageJson } from "type-fest";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export interface ExtensionInfo {
  name: string;
  version?: string;
  requireConfirmation?: boolean;
}

interface NpmPackageVersionDescriptor extends PackageJson {
  dist: {
    integrity: string;
    shasum: string;
    tarball: string;
  };
}

interface NpmRegistryPackageDescriptor {
  versions: Partial<Record<string, NpmPackageVersionDescriptor>>;
  "dist-tags"?: Partial<Record<string, string>>;
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
    const downloadJson = di.inject(downloadJsonInjectable);
    const downloadBinary = di.inject(downloadBinaryInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (info) => {
      const { name, version: versionOrTagName, requireConfirmation = false } = info;
      const disposer = extensionInstallationStateStore.startPreInstall();
      const baseUrl = await getBaseRegistryUrl();
      const registryUrl = new URLParse(baseUrl).set("pathname", name).toString();
      let json: NpmRegistryPackageDescriptor;

      try {
        const result = await downloadJson(registryUrl);

        if (!result.isOk) {
          showErrorNotification(`Failed to get registry information for extension: ${result.error}`);

          return disposer();
        }

        if (!isObject(result.value) || Array.isArray(result.value)) {
          showErrorNotification("Failed to get registry information for extension");

          return disposer();
        }

        if (result.value.error || !isObject(result.value.versions)) {
          const message = result.value.error ? `: ${String(result.value.error)}` : "";

          showErrorNotification(`Failed to get registry information for extension${message}`);

          return disposer();
        }

        json = result.value as unknown as NpmRegistryPackageDescriptor;
      } catch (error) {
        if (error instanceof SyntaxError) {
          // assume invalid JSON
          logger.warn("Set registry has invalid json", { url: baseUrl }, error);
          showErrorNotification("Failed to get valid registry information for extension. Registry did not return valid JSON");
        } else {
          logger.error("Failed to download registry information", error);
          showErrorNotification(`Failed to get valid registry information for extension. ${String(error)}`);
        }

        return disposer();
      }

      let version = versionOrTagName;

      if (versionOrTagName) {
        validDistTagName:
        if (!json.versions[versionOrTagName]) {
          if (json["dist-tags"]) {
            const potentialVersion = json["dist-tags"][versionOrTagName];

            if (potentialVersion) {
              if (!json.versions[potentialVersion]) {
                showErrorNotification((
                  <p>
                    Configured registry claims to have tag
                    {" "}
                    <code>{versionOrTagName}</code>
                    .
                    {" "}
                    But does not have version infomation for the reference.
                  </p>
                ));

                return disposer();
              }

              version = potentialVersion;
              break validDistTagName;
            }
          }

          showErrorNotification((
            <p>
              {"The "}
              <em>{name}</em>
              {" extension does not have a version or tag "}
              <code>{versionOrTagName}</code>
              .
            </p>
          ));

          return disposer();
        }
      } else {
        const versions = Object.keys(json.versions)
          .map(version => new SemVer(version, { loose: true }))
          // ignore pre-releases for auto picking the version
          .filter(version => version.prerelease.length === 0);

        const latestVersion = reduce(versions, (prev, curr) => prev.compareMain(curr) === -1 ? curr : prev);

        version = latestVersion?.format();
      }

      if (!version) {
        logger.error("No versions supplied for extension", { name });
        showErrorNotification(`No versions found for ${name}`);

        return disposer();
      }

      const versionInfo = json.versions[version];
      const tarballUrl = versionInfo?.dist.tarball;

      if (!tarballUrl) {
        showErrorNotification("Configured registry has invalid data model. Please verify that it is like NPM's.");
        logger.warn(`[ATTEMPT-INSTALL-BY-INFO]: registry returned unexpected data, final version is ${version} but the versions object is missing .dist.tarball as a string`, versionInfo);

        return disposer();
      }

      if (requireConfirmation) {
        const proceed = await confirm({
          message: (
            <p>
              {"Are you sure you want to install "}
              <b>
                {`${name}@${version}`}
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

      const fileName = getBasenameOfPath(tarballUrl);
      const { signal } = withTimeout(10 * 60 * 1000);
      const request = await downloadBinary(tarballUrl, { signal });

      if (!request.isOk) {
        showErrorNotification(`Failed to download extension: ${request.error}`);

        return disposer();
      }

      return attemptInstall({ fileName, data: request.value }, disposer);
    };
  },
});

export default attemptInstallByInfoInjectable;
