// Helper for working with tarball files (.tar, .tgz)
// Docs: https://github.com/npm/node-tar
import tar, { ExtractOptions, FileStat } from "tar";
import path from "path";

export interface ReadFileFromTarOpts<R> {
  tarPath: string;
  filePath: string;
  parse: (buf: Buffer) => R;
}

/**
 * This function is useful for when you want the raw buffer from `readFileFromTar`
 * @param buf the input buffer from reading a file from a tar ball
 */
export function passBuffer(buf: Buffer): Buffer {
  return buf;
}

export function readFileFromTar<R>({ tarPath, filePath, parse }: ReadFileFromTarOpts<R>): Promise<R> {
  return new Promise((resolve, reject) => {
    const fileChunks: Buffer[] = [];

    tar.list({
      file: tarPath,
      filter: entryPath => path.normalize(entryPath) === filePath,
      onentry(entry: FileStat) {
        entry.on("data", chunk => {
          if (chunk instanceof Buffer) {
            fileChunks.push(chunk);
          } else if (typeof chunk === "string") {
            fileChunks.push(Buffer.from(chunk));
          }
        });
        entry.once("error", err => {
          reject(new Error(`reading file has failed ${entry.path}: ${err}`));
        });
        entry.once("end", () => {
          resolve(parse(Buffer.concat(fileChunks)));
        });
      },
    });

    if (!fileChunks.length) {
      reject(new Error(`File not found: ${filePath}`));
    }
  });
}

export async function listTarEntries(filePath: string): Promise<string[]> {
  const entries: string[] = [];

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
