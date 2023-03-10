/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Singleton } from "../../common/utils/singleton";
import type { LensExtension } from "../lens-extension";
import { createHash } from "crypto";
import { broadcastMessage } from "../../common/ipc";

export const IpcPrefix = Symbol();

export abstract class IpcRegistrar extends Singleton {
  readonly [IpcPrefix]: string;

  constructor(protected readonly extension: LensExtension) {
    super();
    this[IpcPrefix] = createHash("sha256").update(extension.id).digest("hex");
  }

  /**
   *
   * @param channel The channel to broadcast to your whole extension, both `main` and `renderer`
   * @param args The arguments passed to all listeners
   */
  broadcast(channel: string, ...args: any[]): void {
    broadcastMessage(`extensions@${this[IpcPrefix]}:${channel}`, ...args);
  }
}
