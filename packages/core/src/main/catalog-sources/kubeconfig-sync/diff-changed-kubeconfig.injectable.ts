/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stats } from "fs";
import { constants } from "fs";
import type { ObservableMap } from "mobx";
import type { Readable } from "stream";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import createReadFileStreamInjectable from "../../../common/fs/create-read-file-stream.injectable";
import type { Disposer } from "@k8slens/utilities";
import { bytesToUnits, noop } from "@k8slens/utilities";
import computeKubeconfigDiffInjectable from "./compute-diff.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

export interface DiffChangedKubeconfigArgs {
  filePath: string;
  source: ObservableMap<string, [Cluster, CatalogEntity]>;
  stats: Stats;
  maxAllowedFileReadSize: number;
}
export type DiffChangedKubeconfig = (args: DiffChangedKubeconfigArgs) => Disposer;

const diffChangedKubeconfigInjectable = getInjectable({
  id: "diff-changed-kubeconfig",
  instantiate: (di): DiffChangedKubeconfig => {
    const computeKubeconfigDiff = di.inject(computeKubeconfigDiffInjectable);
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const createReadFileStream = di.inject(createReadFileStreamInjectable);

    return ({ filePath, maxAllowedFileReadSize, source, stats }) => {
      logger.debug(`file changed`, { filePath });

      if (stats.size >= maxAllowedFileReadSize) {
        logger.warn(`skipping ${filePath}: size=${bytesToUnits(stats.size)} is larger than maxSize=${bytesToUnits(maxAllowedFileReadSize)}`);
        source.clear();

        return noop;
      }

      const fileReader = createReadFileStream(filePath, {
        mode: constants.O_RDONLY,
      });
      const readStream = fileReader as Readable;
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
            computeKubeconfigDiff(fileString, source, filePath);
          }
        });

      return cleanup;
    };
  },
});

export default diffChangedKubeconfigInjectable;
