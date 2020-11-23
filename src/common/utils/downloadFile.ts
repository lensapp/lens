import request from "request";

export interface DownloadFileOptions {
  url: string;
  gzip?: boolean;
}

export interface DownloadFileTicket {
  url: string;
  promise: Promise<Buffer>;
  cancel(): void;
}

export function downloadFile(opts: DownloadFileOptions): DownloadFileTicket {
  const { url, gzip = true } = opts;
  const fileChunks: Buffer[] = [];
  const req = request(url, { gzip });
  const promise: Promise<Buffer> = new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer) => {
      fileChunks.push(chunk);
    });
    req.on("complete", () => {
      resolve(Buffer.concat(fileChunks));
    });
    req.on("error", err => {
      reject({ url, err });
    });
  });
  return {
    url: url,
    promise: promise,
    cancel() {
      req.abort();
    }
  }
}
