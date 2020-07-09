import logger from "./logger";
import { createServer } from "net";
import { AddressInfo } from "net";

async function getNextAvailablePort(): Promise<number> {
  logger.debug("getNextAvailablePort() start");
  const server = createServer();
  server.unref();
  return new Promise<number>((resolve, reject) =>
    server
      .on('error', (error: any) => reject(error))
      .on('listening', () => {
        logger.debug("*** server listening event ***");
        const _port = (server.address() as AddressInfo).port;
        server.close(() => resolve(_port));
      })
      .listen({host: "127.0.0.1", port: 0}));
}

export async function getFreePort(): Promise<number> {
  logger.debug("getFreePort() start");
  try {
    const freePort = await getNextAvailablePort();
    logger.debug("got port : " + freePort);
    return freePort;
  } catch(error) {
    throw("getNextAvailablePort() threw: '" + error + "'");
  }
}
