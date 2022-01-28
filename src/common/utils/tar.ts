/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with tarball files (.tar, .tgz)
// Docs: https://github.com/npm/node-tar
import tar, { ExtractOptions, FileStat } from "tar";
import path from "path";

export interface ReadFileFromTarOpts {
  tarPath: string;
  filePath: string;
  parseJson?: boolean;
}

export function readFileFromTar<R = Buffer>({ tarPath, filePath, parseJson }: ReadFileFromTarOpts): Promise<R> {
  return new Promise((resolve, reject) => {
    const fileChunks: Buffer[] = [];

    tar.list({
      file: tarPath,
      filter: entryPath => path.normalize(entryPath) === filePath,
      sync: true,
      onentry(entry: FileStat) {
        entry.on("data", chunk => {
          fileChunks.push(chunk);
        });
        entry.once("error", err => {
          reject(new Error(`reading file has failed ${entry.path}: ${err}`));
        });
        entry.once("end", () => {
          const data = Buffer.concat(fileChunks);
          const result = parseJson ? JSON.parse(data.toString("utf8")) : data;

          resolve(result);
        });
      },
    });

    if (!fileChunks.length) {
      reject(new Error("Not found"));
    }
  });
}

export async function listTarEntries(filePath: string): Promise<string[]> {
  const entries: string[] = [];

  // The typings of this is wrong, we do need to await
  // eslint-disable-next-line @typescript-eslint/await-thenable
  await tar.list({
    file: filePath,
    onentry: (entry: FileStat) => {
      entries.push(path.normalize(entry.path as any as string));
    },
  });

  return entries;
}

export function extractTar(filePath: string, opts: ExtractOptions & { sync?: boolean } = {}) {
  return tar.extract({
    file: filePath,
    cwd: path.dirname(filePath),
    ...opts,
  });
}
