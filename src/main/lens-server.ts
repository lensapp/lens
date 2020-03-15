import * as path from "path"
import { spawn, ChildProcess } from "child_process"
import logger from "./logger"
import * as tcpPortUsed from "tcp-port-used"

declare const __static: string;
const isDevelopment = process.env.NODE_ENV !== "production"
let serverPath: string = null
if (isDevelopment) {
  serverPath = path.join(process.cwd(), "binaries", "server", process.platform, "lens-server")
} else {
  serverPath = path.join(process.resourcesPath, "lens-server")
  if (process.platform !== "win32") {
    serverPath = `${serverPath}.txt`
  }
}
if (process.platform === "win32") {
  serverPath = `${serverPath}-${process.arch}.exe`
}


export class LensServer {
  protected serverUrl: string = null
  protected env: NodeJS.ProcessEnv = null
  protected localServer: ChildProcess

  constructor(serverUrl: string, env: NodeJS.ProcessEnv) {
    this.serverUrl = serverUrl
    this.env = env
  }

  public async run(): Promise<void> {
    if (this.localServer) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
    this.localServer = spawn(serverPath, [], {
      env: this.env,
      cwd: __static
    })
    this.localServer.on("exit", (code) => {
      logger.error(`server ${this.serverUrl} exited with code ${code}`)
      this.localServer = null
    })
    this.localServer.stdout.on('data', (data) => {
      logger.debug(`server ${this.serverUrl} stdout: ${data}`)
    })
    this.localServer.stderr.on('data', (data) => {
      logger.debug(`server ${this.serverUrl} stderr: ${data}`)
    })

    return tcpPortUsed.waitUntilUsed(parseInt(this.env.LOCAL_SERVER_PORT), 500, 10000)
  }

  public exit() {
    if (this.localServer) {
      logger.debug(`Stopping local server: ${this.serverUrl}`)
      this.localServer.kill()
      this.localServer = null
    }
  }
}
