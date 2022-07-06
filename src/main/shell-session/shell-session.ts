/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type { Kubectl } from "../kubectl/kubectl";
import type WebSocket from "ws";
import { appEventBus } from "../../common/app-event-bus/event-bus";
import { type TerminalMessage, TerminalChannels } from "../../common/terminal/channels";
import type { EnsureShellProcess } from "./ensure-shell-process.injectable";
import type { GetValidCwd } from "./get-valid-cwd.injectable";
import type { GetShellEnv } from "./get-shell-env.injectable";
import type { Logger } from "../../common/logger";

export class ShellOpenError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(`${message}`, options);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export enum WebSocketCloseEvent {
  /**
   * The connection successfully completed the purpose for which it was created.
   */
  NormalClosure = 1000,
  /**
   * The endpoint is going away, either because of a server failure or because
   * the browser is navigating away from the page that opened the connection.
   */
  GoingAway = 1001,
  /**
   * The endpoint is terminating the connection due to a protocol error.
   */
  ProtocolError = 1002,
  /**
   * The connection is being terminated because the endpoint received data of a
   * type it cannot accept. (For example, a text-only endpoint received binary
   * data.)
   */
  UnsupportedData = 1003,
  /**
   * Indicates that no status code was provided even though one was expected.
   */
  NoStatusReceived = 1005,
  /**
   * Indicates that a connection was closed abnormally (that is, with no close
   * frame being sent) when a status code is expected.
   */
  AbnormalClosure = 1006,
  /**
   *  The endpoint is terminating the connection because a message was received
   * that contained inconsistent data (e.g., non-UTF-8 data within a text message).
   */
  InvalidFramePayloadData = 1007,
  /**
   * The endpoint is terminating the connection because it received a message
   * that violates its policy. This is a generic status code, used when codes
   * 1003 and 1009 are not suitable.
   */
  PolicyViolation = 1008,
  /**
   * The endpoint is terminating the connection because a data frame was
   * received that is too large.
   */
  MessageTooBig = 1009,
  /**
   * The client is terminating the connection because it expected the server to
   * negotiate one or more extension, but the server didn't.
   */
  MissingExtension = 1010,
  /**
   * The server is terminating the connection because it encountered an
   * unexpected condition that prevented it from fulfilling the request.
   */
  InternalError = 1011,
  /**
   * The server is terminating the connection because it is restarting.
   */
  ServiceRestart = 1012,
  /**
   * The server is terminating the connection due to a temporary condition,
   * e.g. it is overloaded and is casting off some of its clients.
   */
  TryAgainLater = 1013,
  /**
   * The server was acting as a gateway or proxy and received an invalid
   * response from the upstream server. This is similar to 502 HTTP Status Code.
   */
  BadGateway = 1014,
  /**
   * Indicates that the connection was closed due to a failure to perform a TLS
   * handshake (e.g., the server certificate can't be verified).
   */
  TlsHandshake = 1015,
}

export interface ShellSessionArgs {
  kubectl: Kubectl;
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
}

export interface ShellSessionDependencies {
  ensureShellProcess: EnsureShellProcess;
  getValidCwd: GetValidCwd;
  getCachedShellEnv: GetShellEnv;
  readonly logger: Logger;
}

export abstract class ShellSession {
  abstract readonly ShellType: string;
  protected abstract readonly cwd: string | undefined;

  protected running = false;
  protected readonly kubectlBinDirP: Promise<string>;
  protected readonly kubeconfigPathP: Promise<string>;
  protected readonly terminalId: string;
  protected readonly kubectl: Kubectl;
  protected readonly websocket: WebSocket;
  protected readonly cluster: Cluster;

  constructor(protected readonly dependencies: ShellSessionDependencies, { cluster, kubectl, tabId, websocket }: ShellSessionArgs) {
    this.cluster = cluster;
    this.kubectl = kubectl;
    this.websocket = websocket;
    this.kubeconfigPathP = this.cluster.getProxyKubeconfigPath();
    this.kubectlBinDirP = this.kubectl.binDir();
    this.terminalId = `${cluster.id}:${tabId}`;
  }

  protected send(message: TerminalMessage): void {
    this.websocket.send(JSON.stringify(message));
  }

  protected async openShellProcess(shell: string, args: string[], env: Record<string, string | undefined>) {
    const cwd = await this.dependencies.getValidCwd(this.cwd, env);
    const { shellProcess, resume, cleanup } = this.dependencies.ensureShellProcess({
      shell,
      args,
      env,
      cwd,
      terminalId: this.terminalId,
    });

    if (resume) {
      this.send({ type: TerminalChannels.CONNECTED });
    }

    this.running = true;
    shellProcess.onData(data => this.send({ type: TerminalChannels.STDOUT, data }));
    shellProcess.onExit(({ exitCode }) => {
      this.dependencies.logger.info(`[SHELL-SESSION]: shell has exited for ${this.terminalId} closed with exitcode=${exitCode}`);

      // This might already be false because of the kill() within the websocket.on("close") handler
      if (this.running) {
        this.running = false;

        if (exitCode > 0) {
          this.send({ type: TerminalChannels.STDOUT, data: "Terminal will auto-close in 15 seconds ..." });
          setTimeout(() => this.exit(), 15 * 1000);
        } else {
          this.exit();
        }
      }
    });

    this.websocket
      .on("message", (rawData: unknown): void => {
        if (!this.running) {
          return void this.dependencies.logger.debug(`[SHELL-SESSION]: received message from ${this.terminalId}, but shellProcess isn't running`);
        }

        if (!(rawData instanceof Buffer)) {
          return void this.dependencies.logger.error(`[SHELL-SESSION]: Received message non-buffer message.`, { rawData });
        }

        const data = rawData.toString();

        try {
          const message: TerminalMessage = JSON.parse(data);

          switch (message.type) {
            case TerminalChannels.STDIN:
              shellProcess.write(message.data);
              break;
            case TerminalChannels.RESIZE:
              shellProcess.resize(message.data.width, message.data.height);
              break;
            case TerminalChannels.PING:
              this.dependencies.logger.silly(`[SHELL-SESSION]: ${this.terminalId} ping!`);
              break;
            default:
              this.dependencies.logger.warn(`[SHELL-SESSION]: unknown or unhandleable message type for ${this.terminalId}`, message);
              break;
          }
        } catch (error) {
          this.dependencies.logger.error(`[SHELL-SESSION]: failed to handle message for ${this.terminalId}`, error);
        }
      })
      .once("close", code => {
        this.dependencies.logger.info(`[SHELL-SESSION]: websocket for ${this.terminalId} closed with code=${WebSocketCloseEvent[code]}(${code})`, { cluster: this.cluster.getMeta() });

        const stopShellSession = this.running
          && (
            (
              code !== WebSocketCloseEvent.AbnormalClosure
              && code !== WebSocketCloseEvent.GoingAway
            )
            || this.cluster.disconnected
          );

        if (stopShellSession) {
          this.running = false;

          try {
            this.dependencies.logger.info(`[SHELL-SESSION]: Killing shell process (pid=${shellProcess.pid}) for ${this.terminalId}`);
            cleanup();
          } catch (error) {
            this.dependencies.logger.warn(`[SHELL-SESSION]: failed to kill shell process (pid=${shellProcess.pid}) for ${this.terminalId}`, error);
          }
        }
      });

    appEventBus.emit({ name: this.ShellType, action: "open" });
  }

  protected getPathEntries(): string[] {
    return [];
  }

  protected getCachedShellEnv() {
    return this.dependencies.getCachedShellEnv({
      cluster: this.cluster,
      initialPathEntries: this.getPathEntries(),
      kubeconfigPathP: this.kubeconfigPathP,
      kubectlBinDirP: this.kubectlBinDirP,
    });
  }

  protected exit(code = WebSocketCloseEvent.NormalClosure) {
    if (this.websocket.readyState == this.websocket.OPEN) {
      this.websocket.close(code);
    }
  }
}
