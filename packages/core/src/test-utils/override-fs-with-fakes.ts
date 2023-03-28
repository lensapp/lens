/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import fsInjectable from "../common/fs/fs.injectable";
import { createFsFromVolume, Volume } from "memfs";
import type {
  ensureDirSync as ensureDirSyncImpl,
  readJsonSync as readJsonSyncImpl,
  writeJsonSync as writeJsonSyncImpl,
} from "fs-extra";

export const getOverrideFsWithFakes = () => {
  const root = createFsFromVolume(Volume.fromJSON({}));

  const readJsonSync = ((file, opts) => {
    const options = typeof opts === "string"
      ? {
        encoding: opts,
      }
      : opts;
    const value = root.readFileSync(file, options as any) as string;

    return JSON.parse(value, options?.reviver);
  }) as typeof readJsonSyncImpl;
  const writeJsonSync = ((file, object, opts) => {
    const options = typeof opts === "string"
      ? {
        encoding: opts,
      }
      : opts;

    root.writeFileSync(file, JSON.stringify(object, options?.replacer, options?.spaces), options as any);
  }) as typeof writeJsonSyncImpl;
  const ensureDirSync = ((path, opts) => {
    const mode = typeof opts === "number"
      ? opts
      : opts?.mode;

    root.mkdirpSync(path, mode);
  }) as typeof ensureDirSyncImpl;

  return (di: DiContainer) => {
    di.override(fsInjectable, () => ({
      pathExists: async (path) => root.existsSync(path),
      pathExistsSync: root.existsSync,
      readFile: root.promises.readFile as any,
      readFileSync: root.readFileSync as any,
      readJson: async (file, opts) => readJsonSync(file, opts),
      readJsonSync,
      writeFile: root.promises.writeFile as any,
      writeFileSync: root.writeFileSync as any,
      writeJson: async (file, obj, opts) => writeJsonSync(file, obj, opts as any),
      writeJsonSync,
      readdir: root.promises.readdir as any,
      lstat: root.promises.lstat as any,
      rm: root.promises.rm,
      access: root.promises.access,
      copy: async (src, dest) => { throw new Error(`Tried to copy '${src}' to '${dest}'. Copying is not yet supported`); },
      ensureDir: async (path, opts) => ensureDirSync(path, opts),
      ensureDirSync,
      createReadStream: root.createReadStream as any,
      stat: root.promises.stat as any,
      unlink: root.promises.unlink,
      rename: root.promises.rename,
    }));
  };
};
