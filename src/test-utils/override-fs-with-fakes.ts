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
import createKubeSyncWatcherInjectable from "../main/catalog-sources/kubeconfig-sync/create-watcher.injectable";
import { isErrnoException } from "../common/utils";
import joinPathsInjectable from "../common/path/join-paths.injectable";

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

  return (di: DiContainer, overrideWatches = false) => {
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
    }));

    if (overrideWatches) {
      di.override(createKubeSyncWatcherInjectable, (di) => {
        const joinPaths = di.inject(joinPathsInjectable);

        return ((path, options) => {
          const watcher = root.watch( path, {
            recursive: options.isDirectorySync,
          });
          const seenPaths = new Set<string>();

          console.log("watching", path);

          watcher.addListener("rename", (eventType, filename: string) => {
            try {
              const stats = root.statSync(filename);

              options.onAdd(filename, stats);
            } catch (error) {
              if (isErrnoException(error) && error.code === "ENOENT") {
                options.onRemove(filename);
              } else {
                options.onError(error as Error);
              }
            }
          });
          watcher.addListener("change", (...args) => {
            const [,filename] = args;

            if (options.isDirectorySync) {
              // For testing purposes just emit change events for all files
              for (const entry of root.readdirSync(filename) as string[]) {
                const path = joinPaths(filename, entry);

                try {
                  const stats = root.statSync(path);

                  if (seenPaths.has(path)) {
                    options.onChange(path, stats);
                  } else {
                    seenPaths.add(path);
                    options.onAdd(path, stats);
                  }
                } catch (error) {
                  options.onError(error as Error);
                }
              }
            } else {
              try {
                const stats = root.statSync(filename);

                if (seenPaths.has(filename)) {
                  options.onChange(filename, stats);
                } else {
                  seenPaths.add(filename);
                  options.onAdd(filename, stats);
                }
              } catch (error) {
                options.onError(error as Error);
              }
            }
          });

          return {
            stop: () => {
              watcher.close();
            },
          };
        });
      });
    }
  };
};
