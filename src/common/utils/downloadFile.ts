import got, { CancelableRequest } from "got";

export interface DownloadFileOptions {
  url: string;
  gzip?: boolean;
  timeout?: number;
}

export function downloadFile({ url, timeout, gzip = true }: DownloadFileOptions): CancelableRequest<Buffer> {
  return got(url, { timeout, decompress: gzip }).buffer();
}
