import { observable } from "mobx";
import { Singleton } from "../../utils";

interface ExtensionState {
  displayName: string;
  // Possible states the extension can be
  state: "installing" | "uninstalling";
}

export class ExtensionStateStore extends Singleton {
  extensionState = observable.map<string, ExtensionState>();
}
