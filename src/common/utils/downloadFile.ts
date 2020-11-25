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

export function downloadFile({ url, gzip = true }: DownloadFileOptions): DownloadFileTicket {
  const fileChunks: Buffer[] = [];
  const req = request(url, { gzip });
  const promise: Promise<Buffer> = new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer) => {
      fileChunks.push(chunk);
    });
    req.once("error", err => {
      reject({ url, err });
    });
    req.once("complete", () => {
      resolve(Buffer.concat(fileChunks));
    });
  });
  return {
    url,
    promise,
    cancel() {
      req.abort();
    }
  };
}
