/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { watch } from "chokidar";
import type { Stats } from "fs";
import type TypedEventEmitter from "typed-emitter";
import type { SingleOrMany } from "@k8slens/utilities";

export interface AlwaysStatWatcherEvents {
  add: (path: string, stats: Stats) => void;
  addDir: (path: string, stats: Stats) => void;
  change: (path: string, stats: Stats) => void;
}

export interface MaybeStatWatcherEvents {
  add: (path: string, stats?: Stats) => void;
  addDir: (path: string, stats?: Stats) => void;
  change: (path: string, stats?: Stats) => void;
}

export type WatcherEvents<AlwaysStat extends boolean> = BaseWatcherEvents
  & (
    AlwaysStat extends true
      ? AlwaysStatWatcherEvents
      : MaybeStatWatcherEvents
  );

export interface BaseWatcherEvents {
  error: (error: Error) => void;
  ready: () => void;
  unlink: (path: string) => void;
  unlinkDir: (path: string) => void;
}

export interface Watcher<AlwaysStat extends boolean> extends TypedEventEmitter<WatcherEvents<AlwaysStat>> {
  close: () => Promise<void>;
}

export type WatcherOptions<AlwaysStat extends boolean> = {
  /**
   * Indicates whether the process should continue to run as long as files are being watched. If
   * set to `false` when using `fsevents` to watch, no more events will be emitted after `ready`,
   * even if the process continues to run.
   */
  persistent?: boolean;

  /**
   * ([anymatch](https://github.com/micromatch/anymatch)-compatible definition) Defines files/paths to
   * be ignored. The whole relative or absolute path is tested, not just filename. If a function
   * with two arguments is provided, it gets called twice per path - once with a single argument
   * (the path), second time with two arguments (the path and the
   * [`fs.Stats`](https://nodejs.org/api/fs.html#fs_class_fs_stats) object of that path).
   */
  ignored?: SingleOrMany<string | RegExp | ((path: string) => boolean)>;

  /**
   * If set to `false` then `add`/`addDir` events are also emitted for matching paths while
   * instantiating the watching as chokidar discovers these file paths (before the `ready` event).
   */
  ignoreInitial?: boolean;

  /**
   * When `false`, only the symlinks themselves will be watched for changes instead of following
   * the link references and bubbling events through the link's path.
   */
  followSymlinks?: boolean;

  /**
   * The base directory from which watch `paths` are to be derived. Paths emitted with events will
   * be relative to this.
   */
  cwd?: string;

  /**
   *  If set to true then the strings passed to .watch() and .add() are treated as literal path
   *  names, even if they look like globs. Default: false.
   */
  disableGlobbing?: boolean;

  /**
   * Whether to use fs.watchFile (backed by polling), or fs.watch. If polling leads to high CPU
   * utilization, consider setting this to `false`. It is typically necessary to **set this to
   * `true` to successfully watch files over a network**, and it may be necessary to successfully
   * watch files in other non-standard situations. Setting to `true` explicitly on OS X overrides
   * the `useFsEvents` default.
   */
  usePolling?: boolean;

  /**
   * Whether to use the `fsevents` watching interface if available. When set to `true` explicitly
   * and `fsevents` is available this supercedes the `usePolling` setting. When set to `false` on
   * OS X, `usePolling: true` becomes the default.
   */
  useFsEvents?: boolean;

  /**
   * If set, limits how many levels of subdirectories will be traversed.
   */
  depth?: number;

  /**
   * Interval of file system polling.
   */
  interval?: number;

  /**
   * Interval of file system polling for binary files. ([see list of binary extensions](https://gi
   * thub.com/sindresorhus/binary-extensions/blob/master/binary-extensions.json))
   */
  binaryInterval?: number;

  /**
   *  Indicates whether to watch files that don't have read permissions if possible. If watching
   *  fails due to `EPERM` or `EACCES` with this set to `true`, the errors will be suppressed
   *  silently.
   */
  ignorePermissionErrors?: boolean;

  /**
   * `true` if `useFsEvents` and `usePolling` are `false`). Automatically filters out artifacts
   * that occur when using editors that use "atomic writes" instead of writing directly to the
   * source file. If a file is re-added within 100 ms of being deleted, Chokidar emits a `change`
   * event rather than `unlink` then `add`. If the default of 100 ms does not work well for you,
   * you can override it by setting `atomic` to a custom value, in milliseconds.
   */
  atomic?: boolean | number;

  /**
   * can be set to an object in order to adjust timing params:
   */
  awaitWriteFinish?: AwaitWriteFinishOptions | boolean;
} & (AlwaysStat extends true
  ? {
    alwaysStat: true;
  }
  : {
    alwaysStat?: false;
  }
);

export interface AwaitWriteFinishOptions {
  /**
   * Amount of time in milliseconds for a file size to remain constant before emitting its event.
   */
  stabilityThreshold?: number;

  /**
   * File size polling interval.
   */
  pollInterval?: number;
}

export type Watch = <AlwaysStat extends boolean = false>(path: string, options?: WatcherOptions<AlwaysStat>) => Watcher<AlwaysStat>;

// TODO: Introduce wrapper to allow simpler API
const watchInjectable = getInjectable({
  id: "watch",
  instantiate: () => watch as Watch,
  causesSideEffects: true,
});

export default watchInjectable;
