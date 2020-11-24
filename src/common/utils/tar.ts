// Helper for working with tarball files (.tar, .tgz)
// Docs: https://github.com/npm/node-tar
import tar, { ExtractOptions, FileStat } from "tar";
import path from "path";

export interface ReadFileFromTarOpts {
  fileName?: string;
  fileMatcher?(path: string, entry: FileStat): boolean;
  notFoundMessage?: string;
}

export function readFileFromTar(tarFilePath: string, opts: ReadFileFromTarOpts): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const fileChunks: Buffer[] = [];
    const {
      fileName,
      fileMatcher = (path: string) => path === fileName,
      notFoundMessage = "File not found",
    } = opts;

    await tar.list({
      file: tarFilePath,
      filter: fileMatcher,
      onentry(entry: FileStat) {
        entry.on("data", chunk => {
          fileChunks.push(chunk);
        });
        entry.once("error", err => {
          reject(`Reading ${entry.path} error: ${err}`);
        });
        entry.once("end", () => {
          resolve(Buffer.concat(fileChunks));
        });
      },
    });

    if (!fileChunks.length) {
      reject(notFoundMessage);
    }
  });
}

export function extractTar(filePath: string, opts: ExtractOptions & { sync?: boolean } = {}) {
  return tar.extract({
    file: filePath,
    cwd: path.dirname(filePath),
    ...opts,
  });
}
