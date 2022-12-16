/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import joinPathsInjectable from "../common/path/join-paths.injectable";
import type { LensExtensionManifest } from "../extensions/lens-extension";
import bundledExtensionsInjectable from "../extensions/extension-discovery/bundled-extensions.injectable";

interface AppConfig {
  di: DiContainer;
  extensions: { path: string }[];
}

export async function startApp(conf: AppConfig) {
  const { di, extensions } = conf;

  const bundledExtensions = di.inject(bundledExtensionsInjectable);
  const readJson = di.inject(readJsonFileInjectable);
  const joinPaths = di.inject(joinPathsInjectable);

  for (const extension of extensions) {
    const manifestPath = joinPaths(extension.path, "package.json");

    bundledExtensions.push({
      id: manifestPath,
      manifest: (await readJson(manifestPath)) as unknown as LensExtensionManifest,
      manifestPath,
      absolutePath: extension.path,
      isCompatible: true,
      isBundled: true,
      isEnabled: true,
    });
  }

  await di.inject(startMainApplicationInjectable);

  return di;
}
