/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import fs from "fs";
import { noop } from "lodash";
import type { ObservableMap } from "mobx";
import type stream from "stream";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import fsInjectable from "../../../common/fs/fs.injectable";
import type { LensLogger } from "../../../common/logger";
import { type Disposer, bytesToUnits, bind } from "../../../common/utils";
import type { ComputeDiffArguments } from "./compute-diff.injectable";
import computeDiffInjectable from "./compute-diff.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

export interface DiffChangedConfigArgs {
  filePath: string;
  source: ObservableMap<string, [Cluster, CatalogEntity]>;
  stats: fs.Stats;
  maxAllowedFileReadSize: number;
}

export interface DiffChangedConfigDependencies {
  readonly logger: LensLogger;
  fsCreateReadStream: (filePath: string, opts?: { mode?: number }) => fs.ReadStream;
  computeDiff: (args: ComputeDiffArguments) => void;
}

function diffChangedConfig(deps: DiffChangedConfigDependencies, args: DiffChangedConfigArgs): Disposer {
  const { fsCreateReadStream, logger, computeDiff } = deps;
  const { filePath, source, stats, maxAllowedFileReadSize } = args;

  logger.debug(`file changed`, { filePath });

  if (stats.size >= maxAllowedFileReadSize) {
    logger.warn(`skipping ${filePath}: size=${bytesToUnits(stats.size)} is larger than maxSize=${bytesToUnits(maxAllowedFileReadSize)}`);
    source.clear();

    return noop;
  }

  // TODO: replace with an AbortController with fs.readFile when we upgrade to Node 16 (after it comes out)
  const fileReader = fsCreateReadStream(filePath, {
    mode: fs.constants.O_RDONLY,
  });
  const readStream: stream.Readable = fileReader;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let fileString = "";
  let closed = false;

  const cleanup = () => {
    closed = true;
    fileReader.close(); // This may not close the stream.
    // Artificially marking end-of-stream, as if the underlying resource had
    // indicated end-of-file by itself, allows the stream to close.
    // This does not cancel pending read operations, and if there is such an
    // operation, the process may still not be able to exit successfully
    // until it finishes.
    fileReader.push(null);
    fileReader.read(0);
    readStream.removeAllListeners();
  };

  readStream
    .on("data", (chunk: Buffer) => {
      try {
        fileString += decoder.decode(chunk, { stream: true });
      } catch (error) {
        logger.warn(`skipping ${filePath}: ${error}`);
        source.clear();
        cleanup();
      }
    })
    .on("close", () => cleanup())
    .on("error", error => {
      cleanup();
      logger.warn(`failed to read file: ${error}`, { filePath });
    })
    .on("end", () => {
      if (!closed) {
        computeDiff({ contents: fileString, source, filePath });
      }
    });

  return cleanup;
}

const diffChangedConfigInjectable = getInjectable({
  instantiate: (di) => bind(diffChangedConfig, null, {
    computeDiff: di.inject(computeDiffInjectable),
    fsCreateReadStream: di.inject(fsInjectable).createReadStream,
    logger: di.inject(kubeconfigSyncLoggerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default diffChangedConfigInjectable;
