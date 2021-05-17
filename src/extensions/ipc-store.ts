import { Singleton } from "../common/utils";
import { LensExtension } from "./lens-extension";
import { createHash } from "crypto";
import { broadcastMessage } from "../common/ipc";

export const IpcPrefix = Symbol();

export abstract class IpcStore extends Singleton {
  readonly [IpcPrefix]: string;

  constructor(protected extension: LensExtension) {
    super();
    this[IpcPrefix] = createHash("sha256").update(extension.id).digest("hex");
  }

  broadcastIpc(channel: string, ...args: any[]): void {
    broadcastMessage(`extensions@${this[IpcPrefix]}:${channel}`, ...args);
  }
}
