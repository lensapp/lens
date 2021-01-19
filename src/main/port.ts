import net, { AddressInfo } from "net";
import logger from "./logger";

// todo: check https://github.com/http-party/node-portfinder ?

export async function getFreePort(): Promise<number> {
  logger.debug("Lookup new free port..");

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.on("listening", () => {
      const port = (server.address() as AddressInfo).port;

      server.close(() => resolve(port));
      logger.debug(`New port found: ${port}`);
    });
    server.on("error", error => {
      logger.error(`Can't resolve new port: "${error}"`);
      reject(error);
    });
    server.listen({ host: "127.0.0.1", port: 0 });
  });
}
