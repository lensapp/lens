import logger from "./logger"
import { createServer, Server, IncomingMessage, ServerResponse } from "http"
import * as request from "request-promise-native"

// Adapted from https://gist.github.com/mikeal/1840641#gistcomment-2896667
function checkPort(port: number) {
  let server: Server = null
  const checkPortHandler = (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
    res.end("lens-port-checker")
    server.close()
  }
  server = createServer(checkPortHandler)
  server.unref()
  return new Promise((resolve, reject) =>
    server
      .on('error', error => reject(error))
      .on('listening', () => resolve(port))
      .listen({host: "127.0.0.1", port: port}))
}

export async function getFreePort(firstPort: number, lastPort: number): Promise<number> {
  let port = firstPort

  while(true) {
    try {
      logger.debug("Checking port " + port + " availability ...")
      await checkPort(port)
      const resp = await request(`http://127.0.0.1:${port}`, {
        timeout: 1000,
        resolveWithFullResponse: true
      })
      if (resp.body !== "lens-port-checker") {
        logger.debug(`Invalid response from ${port}, probably some other process is listening on all interfaces`)
        throw new Error("invalid response")
      }
      return(port)
    } catch(error) {
      if(++port > lastPort) throw("Could not find a free port")
    }
  }
}
