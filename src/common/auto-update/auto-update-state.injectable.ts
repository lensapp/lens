/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { makeObservable, observable } from "mobx";

export type AutoUpdateStateName = "checking" | "available" | "not-available" | "done" | "downloading" | "download-failed" | "download-succeeded" | "idle";

let timerId: NodeJS.Timeout;

export class AutoUpdateState {
  @observable private _state: AutoUpdateStateName;
  @observable private _version: string | undefined = undefined;

  constructor(state: AutoUpdateStateName = "idle") {
    makeObservable(this);

    this._state = state;
  }

  get name(): AutoUpdateStateName {
    return this._state;
  }

  set name(state: AutoUpdateStateName) {
    this._state = state;

    this.triggerIdle();
  }

  get version(): string | undefined {
    return this._version;
  }

  set version(version: string | undefined) {
    this._version = version;

    this.triggerIdle();
  }

  private triggerIdle(): void {
    clearTimeout(timerId);

    switch (this.name) {
      case "checking":
      case "available":
      case "downloading":
      case "idle":
        break;

      case "done":
      case "not-available":
      case "download-failed":
      case "download-succeeded":
        timerId = setTimeout(() => this.name = "idle", 5000);
        break;
    }
  }
}

const AutoUpdateStateInjectable = getInjectable({
  id: "auto-update-state",
  instantiate: () => new AutoUpdateState("idle"),
});

export default AutoUpdateStateInjectable;
