import path from "path";
import request from "request";

export interface DownloadFileOptions {
  url: string;
  fileName?: string; // default: based on filename from URL
  gzip?: boolean; // default: true
}

export interface DownloadFileTicket {
  fileName: string;
  promise: Promise<File>;
  cancel(): void;
}

export function downloadFile(opts: DownloadFileOptions): DownloadFileTicket {
  const { url, gzip = true, fileName = path.basename(url) } = opts;
  const fileChunks: Buffer[] = [];
  const req = request(url, { gzip });
  const promise: Promise<File> = new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer) => {
      fileChunks.push(chunk);
    });
    req.on("complete", () => {
      resolve(new File(fileChunks, fileName));
    });
    req.on("error", err => {
      reject({ url, err });
    });
  });
  return {
    fileName: fileName,
    promise: promise,
    cancel() {
      req.abort();
    }
  }
}
