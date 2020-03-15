import logger from "./logger"
import { createServer } from "net"

// Adapted from https://gist.github.com/mikeal/1840641#gistcomment-2896667
function checkPort(port: number) {
  const server = createServer()
  server.unref()
  return new Promise((resolve, reject) =>
    server
      .on('error', error => reject(error))
      .on('listening', () => server.close(() => resolve(port)))
      .listen({host: "127.0.0.1", port: port}))
}

export async function getFreePort(firstPort: number, lastPort: number): Promise<number> {
  let port = firstPort

  while(true) {
    try {
      logger.debug("Checking port " + port + " availability ...")
      await checkPort(port)
      return(port)
    } catch(error) {
      if(++port > lastPort) throw("Could not find a free port")
    }
  }
}
