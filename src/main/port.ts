import logger from "./logger"
import { createServer, AddressInfo } from "net"

const getNextAvailablePort = () => {
  logger.debug("getNextAvailablePort() start")
  const server = createServer()
  server.unref()
  return new Promise<number>((resolve, reject) =>
    server
      .on('error', (error: any) => reject(error))
      .on('listening', () => {
        logger.debug("*** server listening event ***")
        const _port = (server.address() as AddressInfo).port
        server.close(() => resolve(_port))
      })
      .listen({host: "127.0.0.1", port: 0}))
}

export const getFreePort = async () => {
  logger.debug("getFreePort() start")
  let freePort: number = null
  try {
    freePort = await getNextAvailablePort()
    logger.debug("got port : " + freePort)
  } catch(error) {
    throw("getNextAvailablePort() threw: '" + error + "'")
  }
  return freePort
}
