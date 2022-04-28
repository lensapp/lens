/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stats } from "fs";
import { constants, createReadStream } from "fs";
import type { ObservableMap } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import type { Disposer } from "../../../common/utils";
import { bytesToUnits, noop } from "../../../common/utils";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import type stream from "stream";
import computeDiffInjectable from "./compute-diff.injectable";

export interface DiffChangedConfigArgs {
  filePath: string;
  source: ObservableMap<string, [Cluster, CatalogEntity]>;
  stats: Stats;
  maxAllowedFileReadSize: number;
}

export type DiffChangedConfig = (args: DiffChangedConfigArgs) => Disposer;

const diffChangedConfigInjectable = getInjectable({
  id: "diff-changed-config",
  instantiate: (di): DiffChangedConfig => {
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const computeDiff = di.inject(computeDiffInjectable);

    return ({ filePath, source, stats, maxAllowedFileReadSize }) => {
      logger.debug(`file changed`, { filePath });

      if (stats.size >= maxAllowedFileReadSize) {
        logger.warn(`skipping ${filePath}: size=${bytesToUnits(stats.size)} is larger than maxSize=${bytesToUnits(maxAllowedFileReadSize)}`);
        source.clear();

        return noop;
      }

      // TODO: replace with an AbortController with fs.readFile when we upgrade to Node 16 (after it comes out)
      const fileReader = createReadStream(filePath, {
        mode: constants.O_RDONLY,
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
            computeDiff(fileString, source, filePath);
          }
        });

      return cleanup;
    };
  },
});

export default diffChangedConfigInjectable;
