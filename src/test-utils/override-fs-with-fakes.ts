/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import pathExistsInjectable from "../common/fs/path-exists.injectable";
import { createFsFromVolume, Volume } from "memfs";
import statInjectable from "../common/fs/stat.injectable";

export function overrideFsWithFakes(di: DiContainer, memFsVolume = Volume.fromJSON({})) {
  const inMemoryFs = createFsFromVolume(memFsVolume);

  di.override(readFileInjectable, () => (
    (filePath) => Promise.resolve(inMemoryFs.readFileSync(filePath, { encoding: "utf-8" }))
  ));
  di.override(writeJsonFileInjectable, () => (
    (filePath, contents) => Promise.resolve(inMemoryFs.writeFileSync(filePath, JSON.stringify(contents)))
  ));
  di.override(readJsonFileInjectable, () => (
    (filePath) => Promise.resolve(JSON.parse(inMemoryFs.readFileSync(filePath, { encoding: "utf-8" }) as string))
  ));
  di.override(pathExistsInjectable, () => (
    (filePath) => Promise.resolve(inMemoryFs.existsSync(filePath))
  ));
  di.override(statInjectable, () => (
    (filePath) => Promise.resolve(inMemoryFs.statSync(filePath))
  ));
}
