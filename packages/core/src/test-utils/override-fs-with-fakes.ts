/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { FileSystemFunctions } from "../common/fs/fs.injectable";
import fsInjectable from "../common/fs/fs.injectable";
import { createFsFromVolume, Volume } from "memfs";
import type {
  ensureDirSync as ensureDirSyncImpl,
  readJsonSync as readJsonSyncImpl,
  writeJsonSync as writeJsonSyncImpl,
  WriteOptions,
} from "fs-extra";
import type { IReadFileOptions, IWriteFileOptions } from "memfs/lib/volume";

export const getOverrideFsWithFakes = () => {
  const root = createFsFromVolume(Volume.fromJSON({}));

  const readJsonSync = ((file, opts) => {
    const options = typeof opts === "string"
      ? {
        encoding: opts,
      }
      : opts;
    const value = root.readFileSync(file, options as unknown as IReadFileOptions) as string;

    return JSON.parse(value, options?.reviver as Parameters<typeof JSON.parse>[1]) as unknown;
  }) as typeof readJsonSyncImpl;
  const writeJsonSync = ((file, object, opts) => {
    const options = typeof opts === "string"
      ? {
        encoding: opts,
      }
      : opts;

    root.writeFileSync(
      file,
      JSON.stringify(
        object,
        options?.replacer as Parameters<typeof JSON.stringify>[1],
        options?.spaces,
      ),
      options as unknown as IWriteFileOptions,
    );
  }) as typeof writeJsonSyncImpl;
  const ensureDirSync = ((path, opts) => {
    const mode = typeof opts === "number"
      ? opts
      : opts?.mode;

    root.mkdirpSync(path, mode);
  }) as typeof ensureDirSyncImpl;

  return (di: DiContainer) => {
    di.override(fsInjectable, () => ({
      pathExists: async (path) => Promise.resolve(root.existsSync(path)),
      pathExistsSync: (path) => root.existsSync(path),
      readFile: (async (...args) => (await root.promises.readFile(...args as Parameters<typeof root.promises.readFile>))) as FileSystemFunctions["readFile"],
      readFileSync: ((...args) => (root.readFileSync(...args as Parameters<typeof root.readFileSync>))) as FileSystemFunctions["readFileSync"],
      readJson: async (file, opts) => Promise.resolve(readJsonSync(file, opts)),
      readJsonSync,
      writeFile: (async (...args) => (await root.promises.writeFile(...args as Parameters<typeof root.promises.writeFile>))) as FileSystemFunctions["writeFile"],
      writeFileSync: ((...args) => (root.writeFileSync(...args as Parameters<typeof root.writeFileSync>))) as FileSystemFunctions["writeFileSync"],
      writeJson: async (file, obj, opts) => Promise.resolve(writeJsonSync(file, obj, opts as WriteOptions)),
      writeJsonSync,
      readdir: (async (...args) => (await root.promises.readdir(...args as Parameters<typeof root.promises.readdir>))) as FileSystemFunctions["readdir"],
      lstat: (async (...args) => (await root.promises.lstat(...args as Parameters<typeof root.promises.lstat>) as unknown)) as FileSystemFunctions["lstat"],
      rm: (async (...args) => (await root.promises.rm(...args as Parameters<typeof root.promises.rm>))) as FileSystemFunctions["rm"],
      access: (async (...args) => (await root.promises.access(...args as Parameters<typeof root.promises.access>))) as FileSystemFunctions["access"],
      // eslint-disable-next-line @typescript-eslint/require-await
      copy: async (src, dest) => { throw new Error(`Tried to copy '${src}' to '${dest}'. Copying is not yet supported`); },
      ensureDir: async (path, opts) => Promise.resolve(ensureDirSync(path, opts)),
      ensureDirSync,
      createReadStream: ((...args) => (root.createReadStream(...args as Parameters<typeof root.createReadStream>) as unknown)) as FileSystemFunctions["createReadStream"],
      stat: (async (...args) => (await root.promises.stat(...args as Parameters<typeof root.promises.stat>) as unknown)) as FileSystemFunctions["stat"],
      unlink: (async (...args) => (await root.promises.unlink(...args as Parameters<typeof root.promises.unlink>))) as FileSystemFunctions["unlink"],
      rename: (async (...args) => (await root.promises.rename(...args as Parameters<typeof root.promises.rename>))) as FileSystemFunctions["rename"],
    }));
  };
};
