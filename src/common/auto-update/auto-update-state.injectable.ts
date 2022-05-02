/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { makeObservable, observable } from "mobx";
 
export type AutoUpdateStateName = "checking" | "available" | "not-available" | "done" | "downloading" | "idle";

export class AutoUpdateState {
  @observable private _state: AutoUpdateStateName;
  private timerId: NodeJS.Timeout;

  constructor(state: AutoUpdateStateName = "idle") {
    makeObservable(this);

    this.name = state;
  }

  get name() : AutoUpdateStateName {
    return this._state;
  }

  set name(state: AutoUpdateStateName) {
    this._state = state;

    this.triggerIdle();
  }

  private triggerIdle(): void {
    clearTimeout(this.timerId);
    this.timerId = null;

    switch(this.name) {
      case "checking":
      case "available":
      case "downloading":
      case "idle":
        break;
  
      case "done":
      case "not-available":
        this.timerId = setTimeout(() => this.name = "idle", 5000);
        break;
    }
  }
}

const AutoUpdateStateInjectable = getInjectable({
  id: "auto-update-state",
  instantiate: () => new AutoUpdateState("idle"),
});
 
export default AutoUpdateStateInjectable;
