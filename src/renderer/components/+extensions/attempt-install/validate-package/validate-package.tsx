/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionManifest } from "../../../../../extensions/lens-extension";
import { hasTypedProperty, isObject, isString, listTarEntries, readFileFromTar } from "../../../../../common/utils";
import { manifestFilename } from "../../../../../extensions/extension-discovery/extension-discovery";
import path from "path";

export const validatePackage = async (
  filePath: string,
): Promise<LensExtensionManifest> => {
  const tarFiles = await listTarEntries(filePath);

  // tarball from npm contains single root folder "package/*"
  const firstFile = tarFiles[0];

  if (!firstFile) {
    throw new Error(`invalid extension bundle,  ${manifestFilename} not found`);
  }

  const rootFolder = path.normalize(firstFile).split(path.sep)[0];
  const packedInRootFolder = tarFiles.every(entry =>
    entry.startsWith(rootFolder),
  );
  const manifestLocation = packedInRootFolder
    ? path.join(rootFolder, manifestFilename)
    : manifestFilename;

  if (!tarFiles.includes(manifestLocation)) {
    throw new Error(`invalid extension bundle, ${manifestFilename} not found`);
  }

  const manifest = await readFileFromTar({
    tarPath: filePath,
    filePath: manifestLocation,
    parseJson: true,
  });

  if (
    isObject(manifest)
    && (
      hasTypedProperty(manifest, "main", isString)
      || hasTypedProperty(manifest, "renderer", isString)
    )
  ) {
    return manifest as unknown as LensExtensionManifest;
  }

  throw new Error(`${manifestFilename} must specify "main" and/or "renderer" fields`);
};
