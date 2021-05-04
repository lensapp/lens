import { Readable } from "stream";
import URLParse from "url-parse";

interface GetPortArgs {
  /**
   * Should be case insensitive
   * Must have a named matching group called `address`
   */
  lineRegex: RegExp;
  /**
   * Called when the port is found
   */
  onFind?: () => void;
  /**
   * Timeout for how long to wait for the port.
   * Default: 5s
   */
  timeout?: number;
}

/**
 * Parse lines from `stream` (assumes data comes in lines) to find the port
 * which the source of the stream is watching on.
 * @param stream A readable stream to match lines against
 * @param args The args concerning the stream
 * @returns A Promise for port number
 */
export function getPortFrom(stream: Readable, args: GetPortArgs): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const handler = (data: any) => {
      const logItem: string = data.toString();
      const match = logItem.match(args.lineRegex);

      if (match) {
        // use unknown protocol so that there is no default port
        const addr = new URLParse(`s://${match.groups.address.trim()}`);

        args.onFind?.();
        stream.off("data", handler);
        clearTimeout(timeoutID);
        resolve(+addr.port);
      }
    };
    const timeoutID = setTimeout(() => {
      stream.off("data", handler);
      reject(new Error("failed to retrieve port from stream"));
    }, args.timeout ?? 5000);

    stream.on("data", handler);
  });
}
